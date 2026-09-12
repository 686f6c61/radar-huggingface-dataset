# Oscilla/Bonsai-8B-mlx-1bit

## Resumen

Bonsai-8B-mlx-1bit es la version cuantizada a 1 bit del modelo Bonsai-8B de Prism ML, distribuida en formato MLX nativo para Apple Silicon. Se trata de un transformer denso de 8.190 millones de parametros basado en la arquitectura Qwen3-8B (GQA con 32 cabezas de consulta y 8 de clave/valor, MLP SwiGLU, RoPE y RMSNorm, 36 bloques decodificadores) en el que se han cuantizado a 1 bit los embeddings, las proyecciones de atencion, las proyecciones del MLP y la LM head. El resultado ocupa 1,28 GB en memoria de parametros, frente a los 16,38 GB de la version FP16, lo que supone una reduccion del 92,2 % y un factor de 12,8x.

El modelo resuelve el problema de ejecutar un LLM de 8B en hardware de consumo y movil: cabe comodamente en cualquier Mac y en iPhone o iPad, y alcanza 44 tokens por segundo en iPhone y una mejora de 8,4x en velocidad sobre un M4 Pro respecto a la version de precision completa. La relevancia actual reside en que un modelo de 8B cuantizado a 1 bit de extremo a extremo puede mantener un rendimiento agregado competitivo (70,5 de media en 6 categorias de evaluacion segun el autor) manteniendo una ventana de contexto de 65.536 tokens.

El repositorio de HuggingFace analizado (Oscilla/Bonsai-8B-mlx-1bit) es una publicacion del modelo original de Prism ML (prism-ml/Bonsai-8B-mlx-1bit), cuyo modelo base sin empaquetar es prism-ml/Bonsai-8B-unpacked. Se distribuye bajo licencia Apache 2.0 y existe una version complementaria en GGUF Q1_0_g128 para llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador denso Qwen3-8B: GQA (32 cabezas de consulta / 8 de clave-valor), MLP SwiGLU, RoPE, RMSNorm, 36 bloques |
| Parametros totales | 8,19B (~6,95B sin contar embeddings) segun model card; el recuento de safetensors del repo es 384.131.968 (representacion empaquetada a 1 bit) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | MLX 1-bit g128 (1,25 bpw) y GGUF Q1_0_g128 (1,125 bpw) en el repo complementario |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX 1-bit g128); GGUF Q1_0_g128 disponible por separado |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-8B en su variante densa: 36 bloques decodificadores con atencion de consultas agrupadas (32 cabezas de consulta y 8 de clave-valor), MLP con activacion SwiGLU, codificacion posicional rotatoria (RoPE) y normalizacion RMSNorm. El vocabulario es de 151.936 tokens. La innovacion principal no esta en la topologia, sino en la cuantizacion: los pesos de embeddings, proyecciones de atencion, proyecciones del MLP y LM head se almacenan a 1 bit de extremo a extremo, sin materializacion intermedia en FP16.

El formato de cuantizacion es 1-bit g128: cada peso es un unico bit, donde 0 se mapea a -escala y 1 a +escala, y cada grupo de 128 pesos comparte un factor de escala FP16. Para encajar en el formato de MLX, que almacena escala y sesgo por grupo, se aplica la transformacion `mlx_scale = 2 * original_scale` y `mlx_bias = -original_scale`, lo que reconstruye exactamente los valores -escala y +escala. Esto implica un coste efectivo de 1,25 bits por peso en MLX (un bit de signo mas dos valores FP16 amortizados sobre 128 pesos) frente a 1,125 bpw del formato GGUF Q1_0_g128, que solo necesita una escala FP16 por grupo. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion es no disponible.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta conversational).
- Razonamiento general y respuesta a instrucciones, con una puntuacion agregada declarada de 70,5 en 6 categorias de evaluacion.
- Ejecucion local en dispositivo (on-device) en Mac, iPhone e iPad gracias al formato MLX y a los kernels de decuantizacion en linea.
- Soporte de contexto largo de hasta 65.536 tokens.
- Integracion con MLX en Python (mlx-lm) y con MLX Swift para iOS y macOS.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, modo de pensamiento): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional en iPhone o iPad: el modelo ocupa 1,28 GB de memoria de parametros y genera a 44 tok/s en iPhone, por lo que puede sostener dialogos multi-turno sin conexion a la nube, con la privacidad como ventaja principal.
- Chat local en portatiles Apple Silicon: con 1,28 GB de pesos cabe holgadamente en cualquier Mac y permite asistentes de escritorio con respuestas casi instantaneas (8,4x mas rapido que FP16 en un M4 Pro).
- Procesamiento de documentos largos en local: los 65.536 tokens de contexto permiten resumir, extraer y consultar contratos, informes o transcripciones sin enviar datos a terceros.
- Prototipado rapido y experimentacion en cuadernos Colab: la existencia de un notebook oficial y de un formato de 1,3 GB en disco facilita probar el modelo en entornos gratuitos sin cuotas de VRAM.
- Generacion de texto en aplicaciones moviles nativas: mediante el fork de mlx-swift, un desarrollador puede embeber el modelo en una app iOS o macOS para funciones de autocompletado, redaccion asistida o resumen.
- Despliegue en servidores de bajos recursos: la version GGUF Q1_0_g128 (1,15 GB) permite servir el modelo con llama.cpp en CUDA o Metal, reduciendo el coste de VRAM frente a un 8B en FP16.
- Educacion e investigacion en cuantizacion extrema: sirve como referencia reproducible para estudiar el impacto de la cuantizacion a 1 bit de extremo a extremo sobre el rendimiento de un transformer de 8B.
- Filtrado y clasificacion de texto a gran escala en el borde: al ser tan ligero, puede desplegarse en dispositivos con recursos limitados para tareas de moderacion, etiquetado o enrutamiento.

## Benchmarks y rendimiento

La model card unicamente declara una puntuacion media agregada de 70,5 en 6 categorias de evaluacion, sin desglosar los benchmarks individuales. No se han publicado resultados detallados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Resultado |
|---|---|
| Puntuacion media (6 categorias) | 70,5 |
| Tamano de parametros en memoria | 1,28 GB (MLX 1-bit g128) |
| Reduccion frente a FP16 | 92,2 % (12,8x mas pequeno) |
| Velocidad en M4 Pro | 8,4x mas rapido que FP16 |
| Velocidad en iPhone | 44 tok/s |

## Requisitos de hardware

- VRAM / memoria de parametros estimada: 1,28 GB en formato MLX 1-bit g128; 1,15 GB en GGUF Q1_0_g128; 16,38 GB en FP16 como referencia.
- Cabe en cualquier Mac con Apple Silicon y en iPhone o iPad. No se especifican requisitos minimos exactos, pero 1,28 GB de pesos son asumibles por dispositivos de gama alta actuales.
- GPU recomendadas: Apple Silicon (serie M) para los kernels MLX; el fork de llama.cpp da soporte a CUDA y Metal para la variante GGUF. No se mencionan recomendaciones especificas de A100 o H100, dado el enfoque en dispositivo.
- Opciones de despliegue: mlx-lm (Python) y mlx-swift (iOS/macOS) con los forks de Prism ML para kernels de 1 bit; llama.cpp mediante el fork de Prism ML para la version GGUF; la app Locally AI para iPhone.
- Nota critica de despliegue: la version MLX requiere el fork de Prism ML de MLX (`pip install mlx @ git+https://github.com/PrismML-Eng/mlx.git@prism`), ya que el soporte de kernels de 1 bit aun no esta fusionado en la rama principal.
- Latencia y throughput: 44 tok/s en iPhone y 8,4x mas rapido que FP16 en M4 Pro segun el autor. No se proporcionan cifras de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Bonsai-8B-mlx-1bit | 8,19B (~6,95B sin embeddings) | 65.536 | MLX 1-bit g128 (1,28 GB) | Apache 2.0 | HuggingFace (repo Oscilla y repos Prism ML) |
| Bonsai-8B (FP16, base) | 8,19B | 65.536 | safetensors FP16 (16,38 GB) | Apache 2.0 | prism-ml/Bonsai-8B-unpacked |
| Bonsai-8B-gguf | 8,19B | 65.536 | GGUF Q1_0_g128 (1,15 GB) | Apache 2.0 | prism-ml/Bonsai-8B-gguf |
| Qwen3-8B (original) | 8,19B | 65.536 | safetensors FP16 / BF16 | Apache 2.0 | HuggingFace (Qwen) |

La informacion disponible no incluye comparativas de rendimiento frente a otros modelos de 8B cuantizados a 2, 3 o 4 bits (por ejemplo, variantes GGUF Q4_K_M), por lo que no es posible cuantificar la perdida de calidad frente a esas alternativas.

## Limitaciones y advertencias

- La cuantizacion a 1 bit de extremo a extremo implica una perdida de precision inevitable; aunque el autor declara un rendimiento agregado de 70,5, no se detalla el desglose por categoria ni la degradacion respecto al modelo en FP16.
- No hay informacion sobre sesgos del modelo, composicion del dataset de entrenamiento ni procesos de alineacion (RLHF/DPO), por lo que no puede evaluarse el riesgo de sesgo ni de contenido inapropiado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; como en cualquier LLM, existe y debe mitigarse en produccion.
- Idiomas soportados: no disponible. No puede confirmarse el rendimiento multilingue, lo que limita su uso en aplicaciones fuera del ingles sin validacion previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion correspondiente.
- Dependencia de un fork no oficial: la variante MLX requiere el fork de Prism ML de MLX con kernels de 1 bit, cuya fusion en la rama principal esta pendiente, lo que introduce riesgo de mantenimiento y de compatibilidad futura.
- Discrepancia de recuento de parametros: el repo safetensors reporta 384.131.968 parametros frente a los 8,19B de la model card, debido al empaquetado a 1 bit; conviene no confundir ambos datos al planificar recursos.
- Rendimiento dependiente del hardware: las cifras de 44 tok/s y 8,4x corresponden a dispositivos concretos (iPhone y M4 Pro) y pueden no reproducirse en otros equipos.
- La busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos eran de tematicas no relacionadas (ciclismo y ayuda de YouTube) y se han descartado.

## Enlaces

- HuggingFace (repo analizado): https://huggingface.co/Oscilla/Bonsai-8B-mlx-1bit
- Modelo base sin empaquetar: https://huggingface.co/prism-ml/Bonsai-8B-unpacked
- Version GGUF Q1_0_g128: https://huggingface.co/prism-ml/Bonsai-8B-gguf
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/1-bit-bonsai-8b-whitepaper.pdf
- Repositorio de demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Cuaderno de Colab: https://colab.research.google.com/drive/1EzyAaQ2nwDv_1X0jaC5XiVC3ZREg9bdG?usp=sharing
- Discord: https://discord.gg/prismml
- Fork de MLX con kernels de 1 bit: https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift con kernels de 1 bit: https://github.com/PrismML-Eng/mlx-swift
- Fork de llama.cpp con kernels de 1 bit: https://github.com/PrismML-Eng/llama.cpp
- App Locally AI (soporte iPhone): https://locallyai.app/

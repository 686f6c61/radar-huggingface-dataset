# schwyzquants/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado en HuggingFace por el usuario schwyzquants, con licencia MIT declarada y pipeline image-text-to-text. Segun la model card, se trata de un modelo con 552.000 millones de parametros en el backbone, contexto de hasta un millon de tokens y procesamiento nativo de imagenes y texto, con generacion de texto autoregresiva. La arquitectura se describe como Causal Encoder-Decoder (CED): un transformer de 40 capas dividido en 20 capas de encoder causal y 20 de decoder.

Su propuesta tecnica se centra en la compresion de la cache KV para cargas de trabajo agenticas con entradas muy largas. La model card afirma que el decoder proyecta su cache KV global desde los estados ocultos finales del encoder, lo que permite activar solo 8.000 millones de parametros por token en prefill y 16.000 millones en decode, y que el uso de Compressed Sparse Attention 2 (CSA2) junto con cache KV principal en FP4 reduce la huella global a 890 bytes por token, aproximadamente una cuarta parte de DeepSeek-V4-Flash.

Es relevante ahora porque ataca uno de los cuellos de botella practicos de los modelos de contexto largo: el coste de memoria de la cache KV en inferencia. Sin embargo, la procedencia del repositorio no esta verificada: el autor declarado no es la organizacion oficial deepseek-ai, el repositorio acumula cero descargas y cero interacciones, y existe una discrepancia entre los 552.000 millones de parametros que declara la model card y los 763.205.315.794 parametros que reportan los metadatos de safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Causal Encoder-Decoder (CED) de 40 capas (20 encoder causal + 20 decoder) con capas Mixture-of-Experts y atencion dispersa CSA2 |
| Parametros totales | 763.205.315.794 (~763,2 B) segun metadatos de safetensors; la model card declara 552 B en el backbone mas 196 B de memoria condicional Engram |
| Parametros activos | 8 B por token en prefill y 16 B por token en decode, segun la model card |
| Longitud de contexto | Hasta 1.000.000 de tokens |
| Tipos de cuantizacion | Pesos en 8-bit / FP8 (tags del repositorio); cache KV principal en FP4 (formato E2M1, una escala E4M3 por cada 16 canales) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura declarada combina varias piezas. El cuerpo principal es un transformer de 40 capas organizado como Causal Encoder-Decoder, donde la cache KV global del decoder se proyecta desde los estados ocultos finales del encoder en lugar de derivarse de cada capa del decoder. Las capas MoE emplean 1 experto compartido y 384 expertos enrutados, activando 6 expertos enrutados por token. La atencion usa Compressed Sparse Attention 2 (CSA2), que asigna a cada capa uno de tres modos estaticos (Full, Reindex o Reuse) para compartir KV principal e indice K entre capas y reutilizar indices de atencion dispersa Top-K; en el decoder, un indexador disperso jerarquico restringe las capas de indexacion posteriores a un pool de candidatos construido por la primera capa en modo Full. Se suman Single-Pass mHC (mezcla del flujo residual con un kernel Mega-mHC), memoria condicional Engram de 196.000 millones de parametros con acceso disperso por lookup basado en token, y decodificacion especulativa DSpark con verificacion programada por confianza. El componente multimodal es un encoder de vision DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3x3 pixel-unshuffle, seguido de un proyector MLP de dos capas.

El preentrenamiento se realiza desde cero sobre un corpus multimodal de 45 billones de tokens, con la atencion dispersa entrenada a una longitud de secuencia de 64K y extension de contexto hasta 1M tokens a partir de los 34 billones de tokens. El post-entrenamiento sigue el paradigma SFT, RL y destilacion on-policy (OPD) sin modificaciones algoritmicas; los cambios se concentran en el pipeline de datos, con sintesis automatica a gran escala de tareas y entornos de agente y escalado progresivo de datos, tareas y rollouts. El modelo incorpora un ajuste de esfuerzo de razonamiento controlable de forma continua mediante un entero de 1 a 100 que intercambia coste de inferencia por precision.

## Capacidades

- Generacion de texto autoregresiva con contexto de hasta 1.000.000 de tokens.
- Comprension de imagenes: el pipeline declarado es image-text-to-text, con encoder DeepSeek-ViT y proyector MLP; la salida es texto.
- Razonamiento con esfuerzo controlable mediante un parametro entero de 1 a 100.
- Cargas agenticas: el post-entrenamiento se basa en sintesis automatica de tareas y entornos de agente, y la model card describe el modelo como optimizado para cargas con muchas entradas (prefill barato, 8 B de parametros activos por token).
- Tool calling / function calling: no se detalla el formato ni el soporte explicito; el repositorio incluye el tag endpoints_compatible, pero no hay documentacion de esquemas de llamadas a herramientas en la informacion disponible.
- Decodificacion especulativa integrada (DSpark), con generacion de borradores semiautoregresiva y verificacion programada por confianza.
- Memoria condicional Engram de 196.000 millones de parametros con acceso disperso por lookup basado en token.
- Capacidades multilingues: no disponible.
- Modo de pensamiento (thinking mode): no se describe de forma explicita; la unica palanca documentada es el ajuste de esfuerzo de razonamiento de 1 a 100.

## Casos de uso

- Agentes de codigo sobre repositorios completos: con un millon de tokens de contexto, el modelo puede ingerir un arbol de fuentes extenso, historico de issues y documentacion en una sola ventana, y operar en varios pasos sin trocear el repositorio; el coste de prefill se reduce al activar solo 8 B de parametros por token en esa fase.
- Analisis de documentacion tecnica multimodal: al aceptar imagen y texto, permite interpretar diagramas de arquitectura, esquemas electricos, planos o capturas de interfaz junto con su texto asociado y generar resumenes o extracciones estructuradas.
- RAG sobre corpus empresariales masivos: la cache KV de 890 bytes por token declarada permite mantener en memoria contextos de cientos de miles de tokens que con otras arquitecturas exigirian mucha mas VRAM, lo que abarata servir recuperacion aumentada con evidencia extensa.
- Atencion al cliente multi-turno: el contexto de 1M tokens admite historiales de conversacion muy largos y bases de conocimiento embebidas en el prompt, manteniendo coherencia entre turnos sin un sistema de memoria externo complejo.
- Pipelines de extraccion de datos estructurados: combinacion de entrada de imagenes de documentos y texto para producir JSON validado, con el ajuste de esfuerzo de razonamiento bajo (cercano a 1) en tareas simples para reducir coste y alto en casos ambiguos.
- Investigacion asistida sobre literatura cientifica: carga simultanea de decenas de articulos, tablas y figuras para comparar metodologias y sintetizar resultados, con esfuerzo de razonamiento elevado en las fases de contraste.
- Despliegue gestionado en Inference Endpoints: el tag endpoints_compatible sugiere compatibilidad con el servicio de HuggingFace, aunque no hay confirmacion del soporte real de la arquitectura deepseek_v41 en los motores de inferencia habituales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de resultados de evaluacion y una figura de rendimiento agentico (figura 1a), pero los valores numericos no forman parte del texto proporcionado, que aparece truncado. Tampoco se han encontrado datos de benchmarks en los resultados de busqueda web, que no contienen referencias utiles al modelo.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 1,53 TB solo para los parametros (763,2 B x 2 bytes), sin contar cache KV ni estados de activacion.
- Pesos en FP8 / 8 bits: aproximadamente 763 GB. El repositorio ocupa 510,3 GB, un tamano coherente con un checkpoint en 8 bits o con pesos parcialmente almacenados en ese formato, pero no permite inferir la configuracion exacta.
- Pesos en 4 bits: aproximadamente 382 GB, aunque no hay evidencia de que existan cuantizaciones de 4 bits publicadas para esta arquitectura.
- Aunque solo se activen 8 B o 16 B de parametros por token, el enrutamiento MoE exige tener disponibles los 384 expertos por capa, por lo que el requisito de memoria total no se reduce de forma proporcional al numero de parametros activos.
- No cabe en ninguna GPU de consumo: ni una RTX 4090 (24 GB) ni una RTX 5090 podrian alojar el modelo. El despliegue requiere multiples aceleradores de 80 GB o 141 GB (A100, H100, H200) o un cluster con offload a CPU y NVMe.
- Opciones de despliegue: la libreria declarada es transformers. No hay evidencia de soporte en vLLM, SGLang, TGI, llama.cpp u Ollama, ni de pesos en formato GGUF.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada solo ofrece referencias comparativas internas de la familia DeepSeek, sin especificaciones completas de los modelos citados. Los valores de cache KV de las alternativas se derivan de los factores de reduccion declarados en la model card y deben tratarse como aproximados.

| Modelo | Parametros | Contexto | Cache KV global por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash (schwyzquants) | 763,2 B segun safetensors; 552 B de backbone segun model card | Hasta 1M tokens | 890 bytes | MIT (declarada) | Repositorio en HuggingFace, 0 descargas, 0 likes |
| DeepSeek-V4-Flash | no disponible | no disponible | ~3.560 bytes (derivado: 4x la de V4.1-Flash) | no disponible | no disponible |
| DeepSeek-V1 | no disponible | no disponible | ~389.000 bytes (derivado: 437x la de V4.1-Flash) | no disponible | no disponible |

Ademas, la model card indica que la huella de cache KV persistente de DeepSeek-V4.1-Flash es aproximadamente 1/8 de la de DeepSeek-V4-Flash. No se dispone de datos de otros modelos multimodales de escala comparable en la informacion proporcionada.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio lo publica el usuario schwyzquants, no la organizacion oficial deepseek-ai, pese a que la model card reproduce logotipos, enlaces y badges de DeepSeek y enlaza a un informe tecnico alojado en el repositorio de deepseek-ai. No hay confirmacion de que el checkpoint corresponda al modelo descrito.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad ni evidencia de que los pesos carguen y funcionen correctamente.
- Discrepancia de parametros: la model card declara 552 B en el backbone (mas 196 B de Engram), mientras que los metadatos de safetensors suman 763.205.315.794 parametros. La diferencia no queda explicada en la informacion disponible.
- Sin resultados de benchmarks publicados en la informacion disponible, no es posible verificar ninguna de las afirmaciones de rendimiento de la model card.
- Tamano prohibitivo: 510,3 GB de repositorio y cientos de gigabytes de pesos en el mejor de los casos, lo que descarta el uso en hardware de consumo y encarece cualquier despliegue.
- Idiomas soportados no declarados: no es posible evaluar la cobertura multilingue ni el comportamiento en castellano.
- Licencia: la metadata y la model card indican MIT, pero conviene verificar el archivo LICENSE real del repositorio y el origen de los pesos, ya que los modelos de DeepSeek suelen publicarse bajo licencias propias con condiciones especificas para uso comercial, distintas de MIT.
- Riesgo de alucinacion inherente a los modelos generativos, agravado porque no hay evaluaciones publicadas de fidelidad ni de tasas de error en tareas factuales.
- Con contextos cercanos al millon de tokens es habitual la degradacion del rendimiento en la parte central del contexto; no hay datos que permitan confirmar o descartar este comportamiento en este modelo.
- Sin soporte confirmado en motores de inferencia de alto rendimiento (vLLM, SGLang, TGI) ni cuantizaciones GGUF para llama.cpp u Ollama, el despliegue practico queda limitado a transformers y sujeto a que la arquitectura deepseek_v41 este implementada.
- La fecha de creacion y actualizacion del repositorio figura como 2026-09-14, dato que se reproduce tal cual aparece en la informacion proporcionada.
- Los resultados de la busqueda web no aportan informacion relevante sobre el modelo: las referencias obtenidas tratan sobre ChatGPT, jailbreaks y subreddits sin relacion con esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/schwyzquants/DeepSeek-V4.1-Flash
- Informe tecnico citado en la model card (alojado en el repositorio de deepseek-ai): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organizacion DeepSeek AI en HuggingFace: https://huggingface.co/deepseek-ai
- Sitio oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Repositorio de figuras de DeepSeek-V2 usado en la model card: https://github.com/deepseek-ai/DeepSeek-V2
- Perfil de X/Twitter de DeepSeek: https://twitter.com/deepseek_ai

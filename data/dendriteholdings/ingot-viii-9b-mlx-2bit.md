# dendriteholdings/Ingot-VIII-9B-MLX-2bit

## Resumen

Ingot-VIII-9B-MLX-2bit es un modelo de generación de texto derivado de Prism ML Ternary Bonsai 2 9B, un transformer de 9.410.903.280 parámetros cuantizado a 2 bits en formato ternario (códigos de 2 bits con escala y sesgo en fp16 por cada bloque de 128 pesos). Lo publica el usuario dendriteholdings como espejo público de una submission ganadora de Ingot, un subnet de Bittensor en el que los mineros cuantizan un modelo profesor fijo y el validador selecciona la copia que más se aproxima a él. El modelo base es prism-ml/Ternary-Bonsai-2-9B-mlx-2bit, a su vez destilación de Qwen3.5-9B.

El interés técnico del modelo reside en su estrategia de compresión extrema: mantiene los códigos ternarios del modelo de Prism ML pero reajusta el resto de pesos para acercarse más al profesor Qwen3.5-9B, logrando una divergencia KL de 0,06830 frente a la del modelo reinante anterior (0,07141) en la misma evaluación. El paquete ocupa 3,46 GB en un único `model.safetensors` con 2,25 bits por peso, lo que lo hace viable en hardware Apple Silicon con memoria unificada modesta.

La relevancia práctica es doble: por un lado, demuestra que la cuantización ternaria con escalas por bloque puede preservar la distribución del profesor con pérdida medible y baja; por otro, su formato propietario `prism_hadamard_qwen35` no lo carga mlx-lm estándar, por lo que requiere el servidor MTPLX para exponerlo como API compatible con OpenAI. No se dispone de información sobre licencia ni sobre idiomas soportados en la documentación publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.5-9B, layout `prism_hadamard_qwen35`) |
| Parametros totales | 9.410.903.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2 bits ternario (códigos de 2 bits, escala fp16 y sesgo −d por cada 128 pesos; 2,25 bits por peso efectivos) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX affine 2-bit); existe un gemelo GGUF en dendriteholdings/Ingot-VIII-9B-Q2 |
| Tamano del repo | 3,5 GB (model.safetensors: 3,46 GB) |
| Libreria | mlx |
| Modelo base | prism-ml/Ternary-Bonsai-2-9B-mlx-2bit (finetune) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de 9B parámetros heredado de Qwen3.5-9B a través de la destilación de Prism ML Ternary Bonsai 2. La contribución del minero no es un reentrenamiento desde cero: parte de los códigos ternarios del modelo de Prism ML y reajusta los pesos restantes (escalas, sesgos y componentes no ternarios) mediante un proceso de ajuste supervisado por la métrica del subnet, cuyo objetivo es minimizar la divergencia KL entre las distribuciones de siguiente token del modelo y las del profesor BF16 Qwen3.5-9B sobre los tokens de respuesta de cada dominio.

La conversión al formato MLX es sin pérdida respecto al upload original del minero: cada bloque de 128 pesos conserva sus códigos ternarios y su escala fp16, mapeados a valores affine 2-bit de MLX (escala d, sesgo −d), de modo que cada peso decodifica al mismo número que usa el kernel GGUF. La torre de visión, la configuración, el tokenizer y los vectores de signos de Hadamard provienen intactos de prism-ml/Ternary-Bonsai-2-9B-mlx-2bit. No se documenta el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento y matemáticas heredados del profesor Qwen3.5-9B, sujetos a la degradación propia de la cuantización ternaria.
- Generación de código, con la misma salvedad de fidelidad respecto al profesor.
- Capacidades multimodales potenciales: el repositorio incluye una torre de visión procedente de Prism ML, aunque la model card no documenta su funcionamiento en este pack.
- Servicio como API compatible con OpenAI mediante MTPLX (`--generation-mode ar`).
- No se documenta soporte explícito de tool calling, function calling ni razonamiento agéntico multi-paso.
- Sin modo thinking declarado ni cabecera MTP de decodificación especulativa en este repositorio.

## Casos de uso

- Despliegue local en Mac con memoria unificada: el pack de 3,46 GB permite ejecutar un modelo de 9B en equipos Apple Silicon de gama media mediante MTPLX, sirviendo una API compatible con OpenAI en el puerto 8080 para prototipos y herramientas internas.
- Evaluación de técnicas de cuantización: investigadores que estudien el impacto de la cuantización ternaria pueden usar este modelo como referencia con métrica KL publicada (0,06830) frente al profesor BF16 y comparar con otras estrategias de compresión.
- Experimentación con subnets de Bittensor: sirve como ejemplo reproducible de una submission ganadora de Ingot, útil para mineros que quieran analizar qué configuración de reajuste de pesos minimiza la divergencia respecto al profesor.
- Generación de texto asistida en local sin conexión: al caber en un solo archivo de menos de 4 GB, es adecuado para entornos air-gapped donde no se puede recurrir a APIs en la nube.
- Chat conversacional de bajo coste: para aplicaciones donde la fidelidad absoluta al profesor no es crítica y prima el consumo mínimo de memoria, el modelo ofrece respuestas conversacionales con una huella de almacenamiento muy reducida.
- Investigación sobre formatos de pesos no estándar: el layout `prism_hadamard_qwen35` y su integración con MTPLX constituyen un caso de estudio para desarrolladores que implementen cargadores de cuantizaciones personalizadas en MLX.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo reinante anterior |
|---|---|---|
| KL(profesor ‖ modelo) en la evaluacion ganadora | 0,06830 | 0,07141 |

La métrica es la divergencia KL de las distribuciones de siguiente token frente al profesor BF16 Qwen3.5-9B, calculada sobre los tokens de respuesta de cada dominio y ponderada por la proporción de muestras de cada dominio. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: en torno a 3,5 GB solo para los pesos; con overhead de ejecución y caché KV, un mínimo práctico de 6-8 GB de memoria unificada.
- Hardware objetivo: Apple Silicon exclusivamente, dado que el formato MLX affine 2-bit y el layout `prism_hadamard_qwen35` requieren el runtime MLX.
- GPU recomendadas: no aplica a CUDA; el gemelo GGUF (dendriteholdings/Ingot-VIII-9B-Q2) puede ejecutarse en el fork de llama.cpp de Dendrite para hardware no Apple.
- Cabe en GPU consumer Apple: sí, en cualquier Mac con al menos 8 GB de memoria unificada (M1 en adelante).
- Opciones de despliegue: MTPLX (`mtplx serve --model dendriteholdings/Ingot-VIII-9B-MLX-2bit --generation-mode ar --port 8080 --no-auth --yes`), que expone API compatible con OpenAI. mlx-lm estándar no carga este layout.
- Latencia y throughput: sin cabecera MTP en este repositorio, MTPLX decodifica un token por paso; no se publican cifras de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ingot-VIII-9B-MLX-2bit | 9,41B | 2-bit ternario (2,25 bpw) | no disponible | no disponible | safetensors MLX |
| prism-ml/Ternary-Bonsai-2-9B-mlx-2bit | 9B (aprox.) | 2-bit ternario | no disponible | no disponible | safetensors MLX |
| dendriteholdings/Ingot-VIII-9B-Q2 | 9,41B (mismo modelo) | 2-bit ternario | no disponible | no disponible | GGUF |
| Qwen3.5-9B (profesor) | 9B (aprox.) | BF16 | no disponible | no disponible | no disponible |

La comparativa se limita a las variantes del mismo linaje, ya que la información disponible no incluye datos de licencia, contexto ni benchmarks estándar que permitan contrastar con alternativas de otros autores. La diferencia medible entre este modelo y el modelo reinante anterior es una KL inferior en 0,00311 (aproximadamente un 4,4 % de mejora relativa).

## Limitaciones y advertencias

- La cuantización ternaria introduce degradación respecto al profesor BF16; la KL de 0,06830 cuantifica esa divergencia, que puede manifestarse en errores factuales o de razonamiento en dominios exigentes.
- Riesgo de alucinación inherente a los modelos de 9B destilados y comprimidos, sin datos publicados sobre mitigación.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; conviene contactar con el autor antes de utilizarlo en producción.
- Idiomas soportados no documentados; se desconoce si conserva la cobertura multilingüe de Qwen3.5-9B.
- Longitud de contexto no disponible, lo que impide planificar aplicaciones con ventanas largas.
- Dependencia de un runtime no estándar (MTPLX) y de un layout propietario (`prism_hadamard_qwen35`) no soportado por mlx-lm, lo que limita la portabilidad y el ecosistema de herramientas.
- Sin cabecera MTP de decodificación especulativa en este repositorio: el rendimiento de decodificación es de un token por paso, sin aceleración.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay validación comunitaria independiente de su calidad.
- El proceso de ajuste está guiado por la métrica del subnet (KL frente al profesor), no por preferencias humanas; puede presentar un ajuste excesivo a esa métrica en detrimento de otras capacidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dendriteholdings/Ingot-VIII-9B-MLX-2bit
- Modelo base (MLX): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-mlx-2bit
- Modelo base (GGUF): https://huggingface.co/prism-ml/Ternary-Bonsai-2-9B-gguf
- Gemelo GGUF de este modelo: https://huggingface.co/dendriteholdings/Ingot-VIII-9B-Q2
- Servidor MTPLX: https://github.com/youssofal/mtplx
- Fork de llama.cpp de Dendrite: https://github.com/DendriteLabs/llama.cpp

# kausikds/DeepSeek-V4.1-Flash

## Resumen

DeepSeek-V4.1-Flash es un modelo multimodal de tipo Mixture-of-Experts (MoE) publicado por el usuario kausikds en Hugging Face bajo licencia MIT, con arquitectura derivada de la familia DeepSeek-V4. El modelo procesa de forma nativa imágenes y texto, y genera texto de forma autorregresiva. Su rasgo más distintivo es la arquitectura Causal Encoder-Decoder (CED), que separa el modelo en un codificador causal de 20 capas y un decodificador de 20 capas, de modo que la caché KV global del decodificador se proyecta desde los estados ocultos finales del codificador en lugar de derivarse de cada capa del decodificador.

El modelo declara 552B de parámetros en el backbone, aunque el recuento real de safetensors en el repositorio asciende a 763.205.315.794 parámetros, diferencia atribuible a componentes adicionales como la memoria condicional Engram (196B parámetros). Durante la inferencia activa solo 8B parámetros por token en prefill y 16B en decode, lo que reduce el coste computacional en cargas de trabajo con entradas muy largas, típicas de agentes. Soporta contextos de hasta un millón de tokens.

Su relevancia actual radica en la compresión agresiva de la caché KV: mediante Compressed Sparse Attention 2 (CSA2) y caché FP4 en formato E2M1, reduce la huella global de KV a 890 bytes por token, aproximadamente una cuarta parte de la de DeepSeek-V4-Flash. El modelo se entrenó desde cero con 45T tokens multimodales y ofrece un ajuste de esfuerzo de razonamiento continuo entre 1 y 100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Encoder-Decoder (CED), Transformer MoE de 40 capas (20 codificador + 20 decodificador) |
| Parametros totales | 552B en backbone; 763.205.315.794 segun safetensors del repo (incluye Engram de 196B) |
| Parametros activos | 8B por token en prefill; 16B por token en decode |
| Longitud de contexto | Hasta 1.000.000 tokens |
| Tipos de cuantizacion | FP8 y 8-bit (tags del repo); caché KV principal en FP4 (formato E2M1, escala E4M3 por 16 canales) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura CED organiza el modelo en 40 capas Transformer: 20 capas de codificador causal seguidas de 20 capas de decodificador. La innovación clave es que la caché KV global del decodificador se proyecta desde los estados ocultos finales del codificador, en lugar de calcularse capa a capa en el decodificador. Esto permite activar solo 8B parámetros por token en prefill y 16B en decode. La técnica SWA Bounded Replay reconstruye los estados KV de ventana deslizante (SWA) ausentes replicando únicamente los *n*_win tokens más recientes, lo que evita persistir la KV SWA en SSD y reduce la huella de caché persistente a aproximadamente 1/8 de la de DeepSeek-V4-Flash.

Compressed Sparse Attention 2 (CSA2) asigna a cada capa de atención uno de tres modos estáticos (Full, Reindex, Reuse) para compartir la KV principal y la K del indexador entre capas, reutilizando además los índices Top-K de atención dispersa. En el decodificador, un indexador jerárquico disperso restringe las capas de indexación posteriores a un conjunto de candidatos construido por la primera capa en modo Full, acotando el coste del indexador independientemente de la longitud de contexto. Cada capa MoE usa 1 experto compartido y 384 expertos enrutados, activando 6 expertos enrutados por token. Se añaden Single-Pass mHC (mezcla de flujo residual con kernel Mega-mHC), memoria condicional Engram (196B parámetros accedidos de forma dispersa por lookup de tokens) y decodificación especulativa DSpark con verificación programada por confianza.

El preentrenamiento se realizó desde cero sobre un corpus multimodal de 45T tokens, con atención dispersa entrenada a longitud de secuencia de 64K y extensión de contexto hasta 1M tokens a los 34T tokens. El postentrenamiento sigue el paradigma SFT → RL → destilación on-policy (OPD) sin modificaciones algorítmicas; los cambios sustantivos están en el pipeline de datos, con síntesis automática a gran escala de tareas y entornos de agente. La parte multimodal emplea un codificador visual DeepSeek-ViT entrenado desde cero con 2D-RoPE y downsampling 3×3 pixel-unshuffle, más un proyector MLP de dos capas.

## Capacidades

- Generación de texto autorregresiva y razonamiento con esfuerzo controlable mediante un entero de 1 a 100 que intercambia coste de inferencia por precisión.
- Procesamiento nativo de imágenes y texto de forma conjunta (pipeline image-text-to-text).
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos y trayectorias de agente.
- Soporte de tool calling y function calling: el repositorio incluye el tag `endpoints_compatible`.
- Capacidades de agente y razonamiento multi-paso, con un pipeline de postentrenamiento centrado en tareas y entornos de agente sintetizados automáticamente.
- Decodificación especulativa DSpark integrada para acelerar la generación.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking explícito: no confirmado en la información disponible; el control de esfuerzo de razonamiento es el mecanismo declarado.

## Casos de uso

- Agentes autónomos con trayectorias largas: el modelo puede mantener conversaciones y planes de varios pasos dentro de un contexto de hasta 1M tokens, y su activación de solo 8B parámetros en prefill abarata el procesamiento de entradas masivas típicas de agentes.
- Análisis de documentos extensos con imágenes: informes, contratos o papers con figuras se procesan conjuntamente gracias al codificador visual DeepSeek-ViT y a la ventana de 1M tokens, sin necesidad de fragmentar el documento.
- Atención al cliente automatizada multi-turno: el bajo coste de caché KV (890 bytes por token) permite servir muchas conversaciones concurrentes en el mismo hardware, manteniendo historial largo por sesión.
- Generación y revisión de código en pipelines de CI/CD: el soporte de tool calling y el modo de razonamiento ajustable permiten invocar herramientas de build o test y calibrar el esfuerzo según la criticidad de la tarea.
- Extracción de información de documentación técnica con diagramas: la combinación de visión y contexto largo permite responder preguntas que cruzan texto y figuras de un mismo manual.
- Investigación y prototipado con licencia permisiva: al ser MIT, se puede integrar en productos comerciales y modificar sin restricciones de uso, algo relevante para equipos que evalúan modelos frontera.
- Razonamiento con presupuesto controlado: el ajuste de esfuerzo 1-100 permite desplegar el mismo modelo en modos de baja latencia (esfuerzo bajo) y alta precisión (esfuerzo alto) según el SLA del servicio.

## Benchmarks y rendimiento

La model card menciona una sección de resultados de evaluación para el modelo base, evaluados en un framework interno con la nota de que las puntuaciones con diferencia inferior a 0,3 se consideran equivalentes, pero los datos numéricos no están incluidos en la información disponible. Tampoco se incluyen cifras de MMLU, HumanEval, GSM8K ni de benchmarks de agente en el texto proporcionado.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 763.205.315.794 parámetros en safetensors y un tamaño de repositorio de 510,3 GB, la inferencia en FP8 requiere del orden de 760 GB de memoria solo para pesos, sin contar caché KV ni activaciones. En cuantización de 8 bits el peso ronda los 760 GB; en 4 bits, en torno a 380 GB.
- GPU recomendadas: no es desplegable en una sola GPU convencional; requiere clústeres multi-GPU. Para FP8 se necesitan varias H100 de 80 GB (del orden de 10 o más) o nodos con H200/B200. No cabe en RTX 4090 (24 GB) ni en consumer GPU de gama alta.
- Despliegue: el repo declara compatibilidad con transformers y endpoints compatibles; para serving a escala se recomienda vLLM o TGI con paralelismo tensorial, aunque la información disponible no confirma soporte explícito de llama.cpp u Ollama para este tamaño.
- Latencia y throughput: no disponibles. La decodificación especulativa DSpark y la reducción de caché KV a 890 bytes por token están diseñadas para mejorar el throughput en cargas con entradas largas, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Caché KV por token | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash | 552B backbone (763B en safetensors), 8B/16B activos | 1M tokens | 890 bytes (FP4) | MIT | Hugging Face (repo kausikds) |
| DeepSeek-V4-Flash | No disponible | No disponible | ~4x mayor que V4.1-Flash (3.560 bytes aprox.) | No disponible | Referencia en la model card |
| DeepSeek-V1 | No disponible | No disponible | ~437x mayor que V4.1-Flash (unos 389 KB) | No disponible | Referencia en la model card |

La model card cita comparaciones con DeepSeek-V4-Flash y DeepSeek-V1 en cuanto a tamaño de caché KV, pero no aporta parámetros, contexto ni licencia de esos modelos en la información disponible. No se dispone de datos de benchmarks comparativos.

## Limitaciones y advertencias

- El repositorio pertenece al usuario kausikds, no a la organización oficial deepseek-ai; la model card incluye enlaces a la organización oficial, pero la autoría del artefacto publicado no está verificada. Conviene tratar los pesos con cautela antes de usarlos en producción.
- El recuento real de parámetros en safetensors (763B) no coincide con los 552B declarados en el backbone; la diferencia se explica por Engram, pero conviene verificar la integridad de los pesos.
- Riesgo de alucinación inherente a modelos generativos de gran escala; no se aportan evaluaciones de fidelidad en la información disponible.
- No se especifican los idiomas soportados, por lo que el rendimiento en castellano no está garantizado ni documentado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Aunque la licencia es MIT, el uso comercial de pesos derivados de un modelo de terceros puede estar sujeto a obligaciones adicionales no reflejadas en la model card; conviene revisar la licencia del modelo original de DeepSeek.
- El tamaño (510,3 GB de repo) y los requisitos de VRAM hacen inviable el despliegue en hardware de consumo; es un modelo de centro de datos.
- La fecha de creación del repo (2026-11-17) y la ausencia de descargas o likes impiden validar su madurez; no hay evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/kausikds/DeepSeek-V4.1-Flash
- Informe técnico (referenciado en la model card): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Organización oficial en Hugging Face: https://huggingface.co/deepseek-ai
- Página principal de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter de DeepSeek: https://twitter.com/deepseek_ai

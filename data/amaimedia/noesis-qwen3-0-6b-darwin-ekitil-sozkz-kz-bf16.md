# AMAImedia/NOESIS-Qwen3-0.6B-Darwin-Ekitil-Sozkz-KZ-BF16

## Resumen

NOESIS-Qwen3-0.6B-Darwin-Ekitil-Sozkz-KZ-BF16 es un modelo de lenguaje de 600 millones de parámetros (673,8 M en pesos reales) especializado en kazajo (KK) y ruso (RU), desarrollado por AMAImedia como parte de la plataforma NOESIS de doblaje multilingüe profesional. Se construye mediante una fusión DARE-TIES de tres checkpoints derivados de Qwen3-600M, todos ellos afinados para el par kazajo-ruso, con el objetivo de obtener un especialista más robusto en kazajo que cualquiera de los modelos fuente por separado.

El modelo usa una arquitectura transformer densa (Qwen3ForCausalLM) con un tokenizer propio de 64 000 entradas, incompatible con el tokenizer estándar de Qwen3 (151 936). Está liberado bajo licencia Apache 2.0 y sus pesos están en formato safetensors con precisión BF16. Su relevancia radica en cubrir un idioma de bajos recursos como el kazajo con un modelo compacto, desplegable en hardware modesto, y en servir como componente de refuerzo lingüístico dentro del framework DHCF-FNO de NOESIS.

Al ser un modelo pequeño y especializado, no compite en capacidades generales con modelos de mayor escala, pero ofrece una opción práctica para tareas concretas en kazajo y ruso, con un coste de inferencia muy bajo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer denso) |
| Parametros totales | 673 786 624 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el modelo base Qwen3-600M soporta 32 768 tokens, pero no se confirma en esta fusión) |
| Tipos de cuantizacion | BF16 (pesos originales); no se especifican cuantizaciones adicionales |
| Idiomas soportados | Kazajo (KK), ruso (RU), inglés (EN) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una fusión DARE-TIES de tres modelos base Qwen3-600M: `ekitil-core-qwen3-600m-kkru-base-v1` (fundación), `ekitil-qwen3-600m-kk` (especialista en kazajo, entrenado 4 500 pasos) y `ekitil-qwen3-600m-kkru` (generalista KK+RU, 2 000 pasos). El método DARE descarta aleatoriamente una fracción de los pesos de cada vector de tarea (densidad 0.53) y reescala los supervivientes; después, TIES selecciona la dirección de mayoría de signo antes de sumar los vectores al modelo base. Se usó una semilla RNG de 1729.

El tokenizer es personalizado, con un vocabulario de 64 000 entradas adaptado al kazajo y ruso, lo que mejora la eficiencia de tokenización frente al tokenizer original de Qwen3 (151 936). No se han publicado detalles sobre el conjunto de datos de entrenamiento de los modelos fuente ni sobre técnicas como RLHF o DPO; la fusión es el único proceso documentado.

## Capacidades

- Generación de texto en kazajo, ruso e inglés, con mayor competencia en kazajo y ruso.
- Comprensión y producción de lenguaje natural en dominios generales, limitada por el tamaño del modelo (600 M).
- Chat conversacional básico mediante plantilla de chat de Qwen3 (aplicable con el tokenizer propio).
- No se documenta soporte para tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.
- El modelo es denso y no presenta capacidades de activación por expertos.

## Casos de uso

- Traducción automática kazajo-ruso e inglés-kazajo: el modelo puede generar traducciones fluidas en estos pares, aprovechando su tokenizer especializado y su entrenamiento bilingüe. Es adecuado para integrarse en pipelines de traducción en entornos con recursos limitados.
- Asistente de atención al cliente en kazajo: gracias a su capacidad de conversación multi-turno y su tamaño compacto, puede desplegarse en servidores modestos o en el edge para gestionar consultas simples en kazajo sin depender de APIs externas.
- Generación de contenido en kazajo para redes sociales o marketing: el modelo produce texto coherente en kazajo, útil para crear publicaciones, descripciones o respuestas automáticas en ese idioma.
- Herramientas educativas para aprendizaje del kazajo: puede usarse como generador de ejercicios, frases de ejemplo o diálogos guiados para estudiantes, dado su dominio del idioma.
- Resumen y extracción de información de documentos en kazajo: al aceptar contextos largos (si se confirma la ventana de 32K del base), podría procesar artículos o informes y generar resúmenes concisos.
- Componente de refuerzo lingüístico en sistemas de doblaje: dentro de la plataforma NOESIS, el modelo actúa como especialista en kazajo con un multiplicador de peso x10 durante la destilación de conocimiento hacia modelos estudiantes más grandes, mejorando la cobertura del idioma en tareas de doblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo o sus fuentes.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,3 GB (tamaño del repo), más overhead de activaciones y caché KV. En cuantización de 4 bits (no proporcionada oficialmente, pero posible con herramientas como llama.cpp o GPTQ) cabría en menos de 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060, o incluso iGPU modernas. Modelos profesionales como A100 o H100 son innecesarios para este tamaño.
- Sí cabe en GPUs de consumo (gama baja y media) y también puede ejecutarse en CPU con razonable velocidad gracias a su tamaño reducido.
- Opciones de despliegue: Transformers (con `device_map="auto"`), vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama, TGI.
- Latencia y throughput estimados: no disponibles, pero al ser un modelo de 600 M, la generación es del orden de decenas de tokens por segundo en GPU consumer y de pocos tokens por segundo en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Vocabulario | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|---|
| NOESIS-Qwen3-0.6B (este) | 673,8 M | No disponible | 64 000 (custom) | KK, RU, EN | Apache 2.0 | Fusión DARE-TIES especializada en KK |
| Qwen3-0.6B (original) | ~600 M | 32 768 | 151 936 | Multilingüe (incl. KK, RU) | Apache 2.0 | Modelo base general, sin especialización KK |
| KazLLM (hipotético, no verificado) | No disponible | No disponible | No disponible | KK | No disponible | No se encontraron datos fiables |

No se dispone de benchmarks comparativos. La principal diferencia frente al Qwen3-0.6B original es el tokenizer reducido a 64K y la fusión específica para kazajo, que probablemente mejore la fluidez en KK a costa de perder algo de cobertura multilingüe.

## Limitaciones y advertencias

- Modelo pequeño (600 M): su capacidad de razonamiento complejo, matemáticas y código es muy limitada en comparación con modelos de 7B o más.
- Tokenizer propio de 64 000 entradas: incompatible con el tokenizer estándar de Qwen3 (151 936). No se puede usar directamente con pipelines que esperen el vocabulario original de Qwen3; requiere adaptación.
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinaciones. Se desconoce su comportamiento en dominios sensibles.
- La fusión DARE-TIES puede introducir inconsistencias en ciertas regiones de pesos, aunque el método está diseñado para mitigarlo.
- Sin soporte documentado para tool calling, agentes o visión; solo generación de texto.
- El contexto máximo no está confirmado; si se hereda de Qwen3-600M, sería 32K, pero no hay garantía tras la fusión.
- Licencia Apache 2.0 permite uso comercial, pero los modelos fuente (ekitil) deben cumplir también sus propias licencias; se asume que son compatibles al estar derivados de Qwen3.
- El repositorio tiene solo 14 descargas y 1 like, lo que indica poca adopción y validación comunitaria limitada.

## Enlaces

- HuggingFace: https://huggingface.co/AMAImedia/NOESIS-Qwen3-0.6B-Darwin-Ekitil-Sozkz-KZ-BF16
- Organización: https://www.amaimedia.com
- Modelos fuente:
  - https://huggingface.co/ekitil/ekitil-core-qwen3-600m-kkru-base-v1
  - https://huggingface.co/ekitil/ekitil-qwen3-600m-kk
  - https://huggingface.co/ekitil/ekitil-qwen3-600m-kkru

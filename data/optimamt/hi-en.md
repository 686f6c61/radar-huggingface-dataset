# OptimaMT/hi-en

## Resumen

OptimaMT/hi-en es una conversión a ONNX del modelo de traducción automática neuronal Xenova/opus-mt-hi-en, que a su vez deriva del modelo OPUS-MT desarrollado por el grupo Language Technology de la Universidad de Helsinki. Se trata de un modelo de traducción hindi-inglés basado en la arquitectura Marian (transformer encoder-decoder), empaquetado para su uso con Transformers.js y ONNX Runtime. El modelo no introduce pesos nuevos: es una copia byte a byte del repositorio original de Xenova, salvo por el decoder fusionado cuantizado, que ha sido recompilado para reducir el consumo de memoria.

La relevancia de esta ficha radica en su orientación a despliegue en el navegador y en entornos con recursos limitados. Frente al modelo base, el autor reporta reducciones de memoria tras la carga de entre el 46 % y el 48 % en Linux y Windows con `disable_quant_qdq = 1`, manteniendo tokens de salida idénticos. Con los valores por defecto de ONNX Runtime la reducción es más modesta (22 % en Linux, 15 % en Windows).

El modelo forma parte del proyecto OptimaMT, que agrupa 49 pares de idiomas bajo el patrón `OptimaMT/<src>-<tgt>`. Su tamaño de repositorio es de 0,1 GB y el vocabulario es de 61.127 tokens. La licencia es CC BY 4.0, heredada de OPUS-MT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian, OPUS-MT) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ONNX cuantizado (q8 en el ejemplo de uso); decoder fusionado cuantizado |
| Idiomas soportados | hindi (hi) → inglés (en) |
| Licencia | CC BY 4.0 |
| Formato de pesos | ONNX (`onnx/decoder_model_merged_quantized.onnx` y resto de ficheros originales) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Marian, un transformer encoder-decoder diseñado específicamente para traducción automática, en la variante OPUS-MT publicada por la Universidad de Helsinki. El modelo original fue entrenado sobre datos paralelos de OPUS y posteriormente exportado a ONNX por Xenova para su uso con Transformers.js. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del corpus ni si se aplicaron etapas de RLHF o DPO; estos datos corresponden al modelo OPUS-MT original y no se detallan en la model card.

La innovación técnica de esta variante concreta no reside en el entrenamiento sino en la optimización del grafo ONNX: el autor ha reconstruido únicamente el fichero del decoder fusionado cuantizado, moviendo la proyección de salida fuera de sus dos ramas (un cambio exclusivamente de grafo, sin alterar pesos). El resto de ficheros del repositorio son idénticos byte a byte al original de Xenova en la revisión `99853100ed9d`. El resultado son los ahorros de memoria ya citados, medidos con ONNX Runtime 1.31.1 en CPU con 4 hilos.

## Capacidades

- Traducción automática unidireccional de hindi a inglés.
- Generación de texto secuencia a secuencia (`text2text-generation`) mediante pipeline de traducción.
- Ejecución en navegador y en Node.js a través de Transformers.js.
- Ejecución en Python mediante ONNX Runtime, SentencePiece y NumPy (script `translate.py` incluido en el repositorio del proyecto).
- Cuantización q8 para reducir huella de memoria en inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Cobertura multilingüe limitada estrictamente al par hindi-inglés.

## Casos de uso

- Traducción de contenido hindi en el navegador: integración del pipeline de Transformers.js en una aplicación web para traducir texto introducido por el usuario sin enviar datos a un servidor, aprovechando la reducción de memoria del decoder fusionado.
- Traducción por lotes en servidores sin GPU: uso del script `translate.py` con ONNX Runtime en CPU para procesar corpus hindi de forma económica, dado el bajo consumo de memoria tras la carga (del orden de 217-278 MiB en Linux según configuración).
- Preprocesado de datos para pipelines de NLP: traducción de documentos hindi a inglés antes de aplicar modelos de análisis, indexación o búsqueda que solo operen en inglés.
- Extensiones y widgets de navegador: el formato ONNX y el tamaño del repositorio (0,1 GB) permiten empaquetar el modelo en extensiones o aplicaciones de escritorio ligeras.
- Traducción en dispositivos con recursos limitados: entornos con poca RAM donde un modelo Marian completo resultaría pesado, gracias al ahorro del 46-48 % reportado con `disable_quant_qdq = 1`.
- Prototipado rápido de sistemas de traducción: el ejemplo de uso de la model card permite poner en marcha un traductor funcional en pocas líneas de JavaScript, útil para validar flujos antes de invertir en modelos mayores.
- Evaluación comparativa de eficiencia: uso como referencia para medir el impacto de optimizaciones de grafo ONNX frente al modelo base de Xenova, con la garantía de tokens idénticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de traducción (BLEU, chrF, COMET u otras métricas) en la información disponible. El autor solo reporta métricas de memoria tras la carga y la identidad de tokens de salida frente al modelo base:

| Metrica | Linux | Windows | Tokens identicos |
|---|---:|---:|---|
| Memoria tras carga, `disable_quant_qdq = 1` | 518 → 278 MiB (-46 %) | 491 → 256 MiB (-48 %) | si |
| Memoria tras carga, valores por defecto de ONNX Runtime | 277 → 217 MiB (-22 %) | 194 → 164 MiB (-15 %) | si |

Mediciones realizadas con ONNX Runtime 1.31.1, CPU, 4 hilos (Windows en máquina virtual).

## Requisitos de hardware

- VRAM estimada: no aplica en el escenario medido (inferencia en CPU); no se proporcionan cifras para GPU.
- Memoria RAM tras la carga: aproximadamente 164-278 MiB según sistema operativo y configuración de ONNX Runtime, según las mediciones del autor.
- GPU recomendadas: no disponibles; el modelo está pensado para CPU y navegador.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU; el repositorio ocupa 0,1 GB.
- Opciones de despliegue: Transformers.js (`@huggingface/transformers`) con `dtype: "q8"`, ONNX Runtime en Python, y en general cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; no se publican cifras de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| OptimaMT/hi-en | no disponible | no disponible | hi → en | CC BY 4.0 | ONNX | Decoder fusionado optimizado; -46/-48 % de memoria con `disable_quant_qdq = 1` |
| Xenova/opus-mt-hi-en | no disponible | no disponible | hi → en | CC BY 4.0 | ONNX | Modelo base directo; misma calidad de tokens, mayor consumo de memoria |
| Helsinki-NLP/opus-mt-hi-en | no disponible | no disponible | hi → en | CC BY 4.0 | safetensors/PyTorch | Modelo original de OPUS-MT; requiere stack PyTorch |

No se dispone de datos de rendimiento de traducción para establecer comparaciones de calidad con alternativas como IndicTrans2 u otros modelos hindi-inglés; no disponibles en la información proporcionada.

## Limitaciones y advertencias

- Traducción unidireccional: solo hindi a inglés; no soporta la dirección inversa ni otros pares.
- Sesgos: al derivar de OPUS-MT, puede heredar sesgos presentes en los corpus paralelos de OPUS, aunque no se documentan análisis específicos.
- Riesgo de alucinación y errores de traducción en dominios especializados, textos con jerga o entradas ambiguas; no se han publicado evaluaciones de calidad en la información disponible.
- Longitud de contexto no documentada; entradas muy largas pueden requerir segmentación previa.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso; no debe emplearse como modelo generalista.
- Licencia CC BY 4.0: permite uso comercial con atribución; es obligatorio acreditar a OPUS-MT (Universidad de Helsinki), a Xenova por la exportación ONNX y a OptimaMT por la modificación del grafo.
- El modelo no introduce mejoras de calidad frente a Xenova/opus-mt-hi-en: los tokens de salida son idénticos; la única ventaja es el ahorro de memoria.
- Los ahorros de memoria reportados dependen de la configuración (`disable_quant_qdq`) y de la versión de ONNX Runtime (1.31.1); pueden variar en otros entornos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; madurez y mantenimiento no verificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OptimaMT/hi-en
- Proyecto OptimaMT (GitHub): https://github.com/AmerAlreyahi/OptimaMT
- Informe metodológico: https://github.com/AmerAlreyahi/OptimaMT/blob/main/REPORT.md
- Script de traducción en Python: https://github.com/AmerAlreyahi/OptimaMT/blob/main/scripts/translate.py
- Demo de resultados: https://huggingface.co/spaces/OptimaMT/results
- Modelo base ONNX: https://huggingface.co/Xenova/opus-mt-hi-en
- Modelo original OPUS-MT: https://huggingface.co/Helsinki-NLP/opus-mt-hi-en

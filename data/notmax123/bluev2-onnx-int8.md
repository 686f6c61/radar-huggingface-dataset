# notmax123/bluev2-onnx-int8

## Resumen

Blue ONNX v2 — INT8 es un paquete de grafos ONNX cuantizados para inferencia del sistema de síntesis de voz Blue / Light Blue TTS, desarrollado originalmente por Max Melichov y empaquetado en este repositorio por el usuario notmax123. Se trata de una variante experimental de la version FP32 slim (notmax123/blue-onnx-v2) en la que los pesos se han convertido a INT8 dinámico para reducir el espacio en disco y facilitar el despliegue en entornos con recursos limitados. El modelo cubre cinco idiomas (hebreo, ingles, espanol, italiano y aleman) e incluye soporte para texto mezclado entre idiomas mediante etiquetas de estilo XML.

El repositorio no contiene un unico modelo monolítico, sino un conjunto de siete grafos ONNX especializados que cubren el pipeline completo de TTS: codificador de texto, estimador de vector de flujo, vocoder, predictor de duracion y tres codificadores auxiliares para clonación de voz zero-shot. Esta modularidad permite sustituir o actualizar componentes de forma independiente y ejecutar el conjunto sobre ONNX Runtime tanto en CPU como en GPU. El tamano total del repositorio es de aproximadamente 0,1 GB.

La relevancia de esta ficha radica en que ilustra una tendencia practica: la cuantización post-entrenamiento de modelos de voz para despliegue en el borde o en navegador, como demuestra la demo publica en bluetts.com. No obstante, el propio autor advierte de que la calidad puede degradarse en prosodia y claridad respecto a la version FP32, por lo que se recomienda esta variante para experimentación y benchmarking, no como opción por defecto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline modular de TTS: codificador de texto, estimador de flujo (flow matching), vocoder y predictores de duracion/estilo; exportado a grafos ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 dinamico weight-only (QUInt8), por tensor (`per_channel=False`); algunas operaciones permanecen en float |
| Idiomas soportados | Hebreo, ingles, espanol, italiano, aleman; soporta texto mezclado con etiquetas XML |
| Licencia | MIT |
| Formato de pesos | ONNX (siete grafos: text_encoder, vector_estimator, vocoder, duration_predictor, codec_encoder, style_encoder, duration_style_encoder) |

## Arquitectura y entrenamiento

El sistema Blue / Light Blue TTS se estructura como un pipeline de síntesis neuronal con etapas diferenciadas. El `text_encoder` convierte identificadores de fonemas y un vector de estilo por voz (TTL) en representaciones internas; el `vector_estimator` actua como campo de flujo condicionado por estilo, con los latentes de CFG e incondicionales ya integrados en el grafo; y el `vocoder` decodifica a forma de onda con las estadísticas de normalización embebidas. El `duration_predictor` estima la duracion condicionada por estilo (`style_dp`), mientras que `codec_encoder`, `style_encoder` y `duration_style_encoder` habilitan la clonación de voz zero-shot a partir de audio de referencia (mel a latente y latente a estilos TTL y DP).

Los grafos se exportaron desde checkpoints de PyTorch mediante el script `exports/export_onnx.py` con la bandera `--int8`, aplicando cuantización dinamica de ONNX Runtime con pesos QUInt8 por tensor. Un detalle tecnico relevante es que esta variante no se ha sometido a limpieza con `onnxslim` (a diferencia de la version FP32 slim), de modo que la cuantización se aplicó sobre la exportación sin optimizar. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Síntesis de voz multilingue en hebreo, ingles, espanol, italiano y aleman.
- Manejo de texto con mezcla de idiomas mediante etiquetas de estilo XML.
- Clonación de voz zero-shot a partir de audio de referencia, gracias a los codificadores de estilo y duracion.
- Control de estilo por voz mediante ficheros JSON de estilo (TTL y DP) que se pasan en tiempo de inferencia.
- Predicción de duracion condicionada por estilo para un ritmo de habla ajustable.
- Ejecución sobre ONNX Runtime en CPU y GPU, con huella de disco reducida por la cuantización INT8.
- Integración con G2P de hebreo mediante el modelo auxiliar renikud (opcional).
- No soporta tool calling, function calling ni razonamiento multi-paso: es exclusivamente un modelo de texto a voz.

## Casos de uso

- Síntesis de voz en navegador: el tamano reducido del bundle INT8 (0,1 GB) y la compatibilidad con ONNX Runtime Web permiten ejecutar TTS en el cliente, como demuestra la demo publica en bluetts.com, sin depender de servidores de inferencia.
- Lectura de contenido multilingue: el soporte de hebreo, ingles, espanol, italiano y aleman con texto mezclado mediante etiquetas XML lo hace adecuado para aplicaciones de lectura de articulos o documentos que alternan idiomas en un mismo parrafo.
- Clonación de voz para accesibilidad: los codificadores de estilo permiten generar una voz personalizada a partir de una muestra de referencia, util en sistemas de comunicacion aumentativa para usuarios que pierden la voz.
- Generacion de audiolibros y podcasts: el control de duracion por estilo y la posibilidad de ajustar el ritmo permiten producir narraciones con cadencia consistente sobre lotes largos de texto.
- Prototipado y benchmarking de cuantización: al ser una variante experimental, sirve para medir la perdida de calidad INT8 frente a FP32 en pipelines de TTS antes de decidir el formato de despliegue.
- Asistentes de voz en dispositivos de borde: la ejecución sobre ONNX Runtime en CPU permite integrar síntesis en dispositivos sin GPU dedicada, reduciendo coste energetico y latencia de red.
- Localización de interfaces habladas: para productos que necesitan avisos de voz en varios idiomas europeos sin contratar servicios cloud de TTS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe cualitativamente el compromiso entre la version FP32 slim (recomendada para calidad) y esta variante INT8 (experimental, con posible degradacion de prosodia y claridad), sin cifras objetivas de MOS, WER ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio completo ocupa 0,1 GB en disco, por lo que la huella en memoria es reducida y compatible con GPU de gama baja.
- GPU recomendadas: no se especifican en la informacion disponible; al ejecutarse sobre ONNX Runtime, es compatible con cualquier GPU soportada por dicho runtime (CUDA, DirectML, etc.).
- Compatibilidad con GPU de consumo: previsiblemente sí, dado el reducido tamano del bundle, aunque no se confirma en la documentacion.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), paquete Python `blue-onnx`, y despliegue web mediante ONNX Runtime Web (demo en bluetts.com). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de TTS.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Blue ONNX v2 INT8 (este repo) | TTS flow matching, modular | HE, EN, ES, IT, DE | MIT | ONNX INT8 | Experimental, sin slim, calidad potencialmente degradada |
| Blue ONNX v2 FP32 slim (notmax123/blue-onnx-v2) | TTS flow matching, modular | HE, EN, ES, IT, DE | MIT | ONNX FP32 | Version recomendada para produccion por calidad |
| Modelos TTS comerciales en la nube | TTS neuronal propietario | Amplio | Propietaria | API | No ejecutables localmente; dependencia de servicio |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas open source de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad experimental: el autor advierte explicitamente de posible degradacion de prosodia y claridad frente a la version FP32 slim; no se recomienda como opcion por defecto en produccion.
- Grafos no optimizados: al no haberse aplicado `onnxslim`, el rendimiento de inferencia puede ser inferior al de la variante FP32 slim, a pesar del menor tamano en disco.
- Dependencia de ficheros externos: los JSON de estilo por voz no se incluyen en el repositorio y deben obtenerse del proyecto BlueTTS; sin ellos la inferencia no funciona correctamente.
- Hebreo requiere G2P adicional: es necesario el modelo renikud (thewh1teagle/renikud) para el preprocesamiento fonetico del hebreo.
- Riesgo de alucinacion acustica: como todo modelo generativo de voz, puede producir artefactos, pronunciaciones erroneas o prosodia inadecuada en texto fuera de dominio.
- Sesgos: no se documentan sesgos especificos, pero la calidad puede variar entre voces, idiomas y estilos de referencia; el rendimiento en espanol, italiano y aleman no esta cuantificado.
- Licencia MIT: permisiva para uso comercial, pero el usuario asume la responsabilidad sobre el uso de voces clonadas y el consentimiento de las personas cuya voz se utilice como referencia.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/notmax123/bluev2-onnx-int8
- Version FP32 slim: https://huggingface.co/notmax123/blue-onnx-v2
- Repositorio BlueTTS: https://github.com/maxmelichov/BlueTTS
- Voces de referencia (JSON de estilo): https://github.com/maxmelichov/BlueTTS/tree/main/voices
- Modelo G2P de hebreo (renikud): https://huggingface.co/thewh1teagle/renikud
- ONNX Runtime: https://onnxruntime.ai/
- Demo en navegador: https://bluetts.com

# elnemer7/ElNeMeR-Romance-Catfish-Sextortion-ONNX

## Resumen

ElNeMeR Romance Catfish-Sextortion-ONNX es un clasificador binario-multiclase exportado a formato ONNX, publicado por el desarrollador independiente Mahmoud ElNemer (elnemer7) bajo el paraguas de su proyecto "Sovereign & Humanitarian Forensic AI Fleet". El modelo se presenta como una herramienta de alerta temprana orientada a la proteccion de mujeres, jovenes y familias frente a estafas románticas con avatares generados por IA, fraudes de aduanas de paqueteria y trampas de sextorsion intima.

Tecnicamente, se trata de un modelo de clasificacion de texto que recibe un tensor de caracteristicas `features` de tipo `float32` con forma `[batch_size, 512]` y devuelve probabilidades sobre tres clases: `safe_social_conversation`, `romance_catfish_lovebomb` y `sextortion_intimate_lure`. El modelo esta exportado con ONNX Opset 14 y es compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que permite su despliegue tanto en servidor como en navegador.

La relevancia del modelo radica en su enfoque de seguridad digital aplicada, un nicho poco cubierto por los grandes modelos generativos. Sin embargo, la informacion publica disponible es extremadamente limitada: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, y la model card no especifica arquitectura interna, datos de entrenamiento, ni metodologia de evaluacion mas alla de una cifra de "calibracion" del 100,00% que no viene acompanada de conjunto de validacion ni metrica detallada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de texto; entrada `float32 [batch_size, 512]`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrada fija de 512 caracteristicas) |
| Tipos de cuantizacion | no disponible (exportado en ONNX Opset 14) |
| Idiomas soportados | no disponible (la model card menciona "Romance" en el nombre, sin detallar idiomas) |
| Licencia | MIT |
| Formato de pesos | ONNX (Opset 14) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente especifica el contrato de entrada/salida: un tensor `features` de tipo `float32` con dimension `[batch_size, 512]` y una salida de probabilidades sobre tres clases. El hecho de que la entrada sea un vector de 512 dimensiones sugiere que el modelo opera sobre embeddings precalculados (posiblemente procedentes de un codificador de texto externo no documentado) o sobre un vector de caracteristicas agregadas, pero no se confirma en la informacion proporcionada.

Tampoco se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. La unica afirmacion tecnica verificable es la exportacion a ONNX Opset 14 con compatibilidad para `onnxruntime` y `onnxruntime-web` (WASM), lo que indica un diseno orientado al despliegue ligero en entornos web y de borde.

## Capacidades

- Clasificacion de conversaciones en tres categorias: conversacion social segura, catfishing romantico con love bombing, y lure de sextorsion intima.
- Deteccion temprana de patrones de estafa romantica y fraude de paqueteria/aduanas, segun la descripcion de la model card.
- Inferencia en navegador mediante `onnxruntime-web` (WASM), lo que permite procesamiento local sin enviar datos a servidores externos.
- Inferencia en servidor mediante `onnxruntime`.
- Entrada basada en vector de caracteristicas de 512 dimensiones, lo que implica que la tokenizacion o extraccion de caracteristicas debe realizarse fuera del modelo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No se documentan capacidades multilingues mas alla de la referencia generica a "Romance" en el nombre.

## Casos de uso

- Moderacion de chats en aplicaciones de citas: el modelo puede clasificar cada conversacion como segura, catfish o sextorsion, permitiendo a la plataforma lanzar avisos automaticos al usuario antes de que se produzca la victimizacion.
- Filtro en aplicaciones de mensajeria para menores: integrado en el cliente mediante `onnxruntime-web`, puede ejecutarse localmente en el navegador y alertar a tutores o al propio menor sin exponer el contenido del chat a terceros.
- Sistemas de alerta temprana en ONGs de proteccion a la mujer: el modelo puede priorizar casos entre un volumen alto de conversaciones reportadas, ayudando a los equipos de soporte a identificar las interacciones de mayor riesgo.
- Deteccion de fraude de paqueteria y aduanas: la model card menciona explicitamente este vector de estafa, por lo que el modelo puede integrarse en flujos de revision de mensajes sospechosos de suplantacion de agencias aduaneras.
- Analisis forense digital: en investigaciones de sextorsion, el modelo puede clasificar grandes volumenes de conversaciones incautadas para separar las que presentan patrones de lure intimo de las conversaciones ordinarias.
- Despliegue en entornos con restricciones de privacidad: al ser ONNX y compatible con WASM, puede ejecutarse en dispositivos sin GPU y sin conexion, lo que encaja en escenarios de asistencia a victimas en zonas con conectividad limitada.
- Integracion en pipelines de moderacion existentes: la salida de probabilidades sobre tres clases permite umbralizar y combinar con otros clasificadores o reglas heurísticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente declara una "Calibration Accuracy" del 100,00%, cifra que no viene acompanada de conjunto de evaluacion, tamano de muestra, metrica (exactitud, F1, AUC) ni comparacion con lineas base, por lo que no puede considerarse un resultado de benchmark verificable.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0.0 GB y la entrada es un vector de 512 dimensiones, lo que sugiere un modelo muy pequeno, pero no se confirma el numero de parametros.
- GPU recomendadas: no disponible. Por el perfil de entrada (vector de 512) y el formato ONNX, es probable que funcione en CPU, pero no se especifica.
- Cabe en GPU de consumo: probablemente si, dado el tamano declarado del repositorio (0.0 GB), aunque no se confirma.
- Opciones de despliegue: `onnxruntime` (servidor) y `onnxruntime-web` con WASM (navegador), segun la model card. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un clasificador de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElNeMeR Romance Catfish-Sextortion-ONNX | no disponible | entrada fija 512 | Clasificacion de conversaciones (3 clases) | MIT | Hugging Face (0 descargas) |
| Alternativas de clasificacion de texto genericas (p. ej. modelos BERT/DistilBERT de clasificacion) | 60M-110M tipico | 512 tokens | Clasificacion de texto multiuso | Apache 2.0 / MIT | Amplia |
| Clasificadores de moderacion de contenido de grandes plataformas | no disponible | variable | Moderacion de contenido | Propietaria | No publica |

No se dispone de informacion sobre modelos comparables especificos para deteccion de catfishing o sextorsion en la informacion proporcionada. La comparativa con clasificadores BERT genericos es orientativa y no se basa en datos de rendimiento del modelo evaluado.

## Limitaciones y advertencias

- No se documenta la arquitectura interna, los datos de entrenamiento ni la metodologia de evaluacion, lo que impide verificar la validez de la cifra de "100,00% de calibracion".
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en la misma marca temporal (2026-11-25T09:24), lo que sugiere una publicacion sin validacion externa.
- El modelo no incluye tokenizador ni extractor de caracteristicas: el usuario debe generar el vector de 512 dimensiones por su cuenta, y no se especifica como.
- Riesgo de alucinacion y falsos positivos: al ser un clasificador de tres clases, puede marcar como sextorsion conversaciones romanticas legitimas o pasar por alto casos que no encajen en sus patrones de entrenamiento.
- No se documentan sesgos conocidos, pero al ser un modelo orientado a "Romance" sin idiomas declarados, se desconoce su cobertura linguistica real y su comportamiento en castellano.
- Licencia MIT: permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte, y no se especifica si los datos de entrenamiento tienen restricciones adicionales.
- La model card incluye afirmaciones de marketing ("Sovereign & Humanitarian Forensic AI Fleet", sello "VERIFIED BY ENG. MAHMOUD ELNEMER") que no constituyen evidencia tecnica.
- No apto para uso forense o legal sin validacion independiente: la clasificacion de conversaciones como prueba o indicio requiere auditoria externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Romance-Catfish-Sextortion-ONNX
- Plataforma forense humanitaria: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
- Contacto del autor: +20 150 755 9911 (WhatsApp / telefono)

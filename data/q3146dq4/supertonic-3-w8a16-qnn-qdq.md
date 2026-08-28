# q3146dq4/supertonic-3-w8a16-qnn-qdq

## Resumen

El modelo `q3146dq4/supertonic-3-w8a16-qnn-qdq` es una cuantización estática W8A16 (pesos UINT8, activaciones UINT16) en formato ONNX QDQ del modelo de síntesis de voz Supertonic 3, desarrollado por Supertone. Esta versión no oficial, creada por el usuario q3146dq4, está orientada a la inferencia eficiente en dispositivos con hardware Qualcomm QNN/HTP, aunque también puede ejecutarse en CPU. El modelo base, Supertonic 3, es un TTS ligero de 99 millones de parámetros que funciona localmente sin GPU ni conexión a la nube, y soporta 31 idiomas.

La cuantización conserva la arquitectura original de cuatro componentes (predictor de duración, codificador de texto, estimador de vectores y vocoder) y mantiene la configuración de inferencia de 8 pasos del estimador de vectores. El proceso de cuantización requirió ajustes específicos en los componentes sensibles —especialmente el predictor de duración y el estimador de vectores— para evitar errores acumulativos en la síntesis. El resultado es un paquete de 0,1 GB que puede desplegarse en entornos con recursos limitados.

Esta ficha resulta relevante para desarrolladores que buscan integrar síntesis de voz multilingüe en aplicaciones móviles o de borde con aceleración Qualcomm, manteniendo un equilibrio entre tamaño, latencia y calidad perceptiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS de cuatro componentes: duration predictor, text encoder, vector estimator y vocoder |
| Parametros totales | 99 millones (modelo base Supertonic 3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo TTS, no procesa contexto de texto largo) |
| Tipos de cuantizacion | W8A16 estatica QDQ (pesos UINT8, activaciones UINT16) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | OpenRAIL-M |
| Formato de pesos | ONNX (archivos .onnx con grafo QDQ) |

## Arquitectura y entrenamiento

El modelo base Supertonic 3 es un sistema de síntesis de voz de arquitectura modular compuesto por cuatro redes neuronales independientes: un predictor de duración que determina la duración de cada fonema, un codificador de texto que convierte el texto de entrada en representaciones lingüísticas, un estimador de vectores que genera las características acústicas mediante un proceso iterativo de 8 pasos, y un vocoder que transforma esas características en la forma de onda final. Esta separación permite optimizar cada componente por separado y facilita la cuantización selectiva.

La cuantización de esta versión se realizó con ONNX Runtime 1.29.0 y ONNX 1.19.x, aplicando cuantización estática QDQ con calibración MinMax y cuantización asimétrica de activaciones. El proceso requirió un ajuste fino de los rangos de cuantización en el predictor de duración para evitar cambios en los límites de los chunks latentes, y en el estimador de vectores para mitigar la acumulación de errores en las 8 iteraciones recursivas. El resultado final mantiene todos los pesos estáticos en UINT8 sin recurrir a pesos UINT16 como alternativa de calidad.

## Capacidades

- Sintesis de voz multilingue: genera habla natural en 31 idiomas, incluyendo europeos, asiaticos y de oriente medio.
- Inferencia en CPU: el modelo base esta disenado para ejecutarse localmente sin GPU, y esta version cuantizada reduce aun mas el coste computacional.
- Compatibilidad con aceleracion Qualcomm: los grafos QDQ estan estructurados para ejecutarse en runtimes QNN/HTP, lo que permite aprovechar los aceleradores de IA de los SoC Qualcomm.
- Configuracion de voces: el repositorio incluye el directorio `voice_styles` con estilos de voz predefinidos para personalizar la salida.
- Despliegue flexible: al ser ONNX, puede integrarse con ONNX Runtime en diversas plataformas (movil, escritorio, embebido).
- Procesamiento de texto a voz completo: desde texto plano hasta audio final, sin necesidad de componentes externos.

## Casos de uso

- Asistentes de voz en dispositivos moviles: el modelo puede integrarse en aplicaciones Android o iOS para generar respuestas habladas sin depender de servicios en la nube, gracias a su tamano reducido (0,1 GB) y su capacidad de ejecucion en CPU o QNN.
- Accesibilidad para personas con discapacidad visual: permite convertir texto de pantalla en audio en tiempo real en 31 idiomas, mejorando la experiencia de lectores de pantalla en dispositivos de bajo coste.
- Audiolibros y contenido narrado: desarrolladores de plataformas de contenido pueden generar narraciones automaticas en multiples idiomas con una calidad aceptable y sin costes de API por caracter.
- Traduccion de voz en tiempo real: combinado con un modulo de traduccion, el modelo puede sintetizar la traduccion hablada en el idioma de destino, util para aplicaciones de interpretacion conversacional.
- Sistemas de navegacion y avisos en vehiculos: la baja latencia y el soporte para ejecucion en hardware Qualcomm lo hacen adecuado para sistemas de infoentretenimiento que requieren respuestas de voz inmediatas.
- Educacion y aprendizaje de idiomas: aplicaciones de practica de pronunciacion pueden usar el modelo para generar ejemplos de habla nativa en cualquiera de los 31 idiomas soportados, facilitando el entrenamiento auditivo.

## Benchmarks y rendimiento

La model card proporciona metricas de validacion numerica comparando la salida de la version cuantizada V7 con el modelo FP32 original, utilizando 12 casos de sintesis completos con 4 textos de prueba y 3 semillas deterministicas:

| Metrica | Valor V7 |
|---|---|
| Log-spectrum cosine (minimo) | 0.976047 |
| Log-spectrum cosine (percentil 25) | 0.983669 |
| Log-spectrum cosine (mediana) | 0.985289 |
| LSD (mediana) | 9.874 dB |
| LSD (maximo) | 12.352 dB |

Estas cifras son controles de regresion numerica, no sustitutos de pruebas perceptivas auditivas. No se han publicado resultados de benchmarks comparativos con otros modelos TTS en la informacion disponible.

## Requisitos de hardware

- Tamano del repositorio: 0,1 GB, lo que indica que los cuatro modelos ONNX caben en memoria de dispositivos de gama media.
- VRAM estimada: no aplica para CPU; para ejecucion en GPU no se ha especificado, pero al ser modelos ONNX ligeros, cualquier GPU con 2 GB de VRAM podria manejarlos.
- GPU recomendadas: no se requiere GPU; el modelo base esta disenado para CPU. Para aceleracion Qualcomm, se recomienda un SoC con soporte QNN/HTP (serie Snapdragon 8 o superior).
- Compatibilidad con hardware de consumo: si, cabe en smartphones, Raspberry Pi y mini-PCs gracias a su tamano reducido.
- Opciones de despliegue: ONNX Runtime con CPUExecutionProvider (validado), o con QNNExecutionProvider para hardware Qualcomm. Tambien puede servirse mediante TGI o vLLM si se adapta, aunque no es el objetivo principal.
- Latencia y throughput: no se han publicado cifras exactas; la validacion se realizo con 8 pasos del estimador de vectores, lo que sugiere una latencia moderada en CPU y muy baja en QNN.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados entre esta cuantizacion y otros modelos TTS ligeros como Piper, Coqui TTS o Edge TTS. La informacion disponible se limita al modelo base Supertonic 3, que destaca por sus 99M parametros y 31 idiomas. Para una comparacion justa, se necesitarian benchmarks comunes (MOS, RTF, tamanos de modelo) que no estan incluidos en la documentacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: este repositorio es un derivado modificado del modelo original y no cuenta con el respaldo de Supertone.
- Degradacion de calidad: la cuantizacion W8A16 introduce errores numericos, especialmente en el estimador de vectores recursivo; las metricas de validacion muestran una mediana de LSD de 9,874 dB, que puede ser perceptible en audiciones criticas.
- Dependencia de hardware QNN: aunque el modelo esta disenado para QNN/HTP, la validacion se realizo en CPU; la ejecucion en hardware Qualcomm requiere verificacion especifica del particionado HTP y puede presentar fallos silenciosos si no se desactiva el fallback a CPU.
- Sesgos de voz: no se documentan sesgos especificos, pero como modelo TTS entrenado con datos limitados, puede tener variaciones de calidad entre idiomas o acentos.
- Riesgo de alucinacion fonetica: en textos ambiguos o con nombres propios, el modelo puede producir pronunciaciones incorrectas.
- Licencia OpenRAIL-M: permite uso comercial pero con restricciones de uso responsable; se recomienda revisar los terminos completos de la licencia.
- Sin soporte oficial: al ser una cuantizacion de terceros, no hay garantia de mantenimiento ni actualizaciones.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/q3146dq4/supertonic-3-w8a16-qnn-qdq
- Modelo base Supertonic 3: https://huggingface.co/Supertone/supertonic-3
- Pagina oficial de Supertonic 3: https://supertonic3.github.io/
- Documentacion de cuantizacion ONNX Runtime: https://onnxruntime.ai/docs/performance/model-optimizations/quantization.html
- Discusiones del repositorio: https://huggingface.co/q3146dq4/supertonic-3/discussions

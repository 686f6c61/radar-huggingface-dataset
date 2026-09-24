# pleasen/Gemma-4-E2B-IT-QAT

## Resumen

`pleasen/Gemma-4-E2B-IT-QAT` es una reconstrucción en formato GGUF del modelo Gemma 4 E2B en su variante instruction-tuned y QAT (quantization-aware training), publicada por el usuario `pleasen` y no por Google DeepMind. El repositorio no aporta pesos nuevos: aplica una batería de optimizaciones sobre el modelo base para reducir su huella de almacenamiento en despliegues móviles y de recursos limitados. Entre ellas, la eliminación de los encoders de audio, la cuantización de las capas de visión a Q8_0 o Q4_K_M y la conversión de los embeddings posicionales de FP32 a FP16, lo que reduce el fichero `mmproj-BF16` a aproximadamente el 14 % y el 20 % de su tamano original para Q4_K_M y Q8_0 respectivamente.

El modelo pertenece a la familia Gemma 4 de Google DeepMind, descrita en las fuentes consultadas como una familia abierta multimodal con entrada de texto e imagen, salida de texto, razonamiento, contexto largo, system prompts y uso nativo de herramientas. La variante E2B es la más ligera de la familia y está pensada para ejecución local eficiente, con el sufijo "E" asociado a parámetros efectivos según el material de terceros consultado.

La relevancia de esta ficha concreta es doble. Por un lado, documenta el estado del arte en modelos multimodales por debajo de los 5 000 millones de parámetros que caben en un teléfono. Por otro, advierte de un riesgo habitual: se trata de un repack de terceros con 0 descargas y 0 likes en el momento de la consulta, cuyo recuento de parámetros en safetensors (4 628 569 635) no coincide con la cifra de ~2,1 mil millones que manejan otras fuentes para la misma variante, sin confirmación oficial disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión) de la familia Gemma 4; encoder de audio eliminado en este repack. No se detalla si emplea activación selectiva ni MoE |
| Parámetros totales | 4 628 569 635 según metadatos de safetensors del repositorio; otras fuentes cifran la variante E2B en ~2,1 mil millones de parámetros (dato no confirmado) |
| Parámetros activos | No confirmado. La información disponible no describe una arquitectura MoE; el desfase entre ambas cifras de parámetros podría deberse a mecanismos de activación selectiva, sin confirmación oficial |
| Longitud de contexto | 8 000 tokens según gemma4.dev para Gemma 4 E2B; la ficha de LM Studio menciona "contexto largo" sin cifra concreta. No disponible con confirmación oficial |
| Tipos de cuantización | GGUF en Q4_K_M y Q8_0 para las capas de visión; proyector multimodal `mmproj-BF16`; embeddings posicionales en FP16 (originalmente FP32) |
| Idiomas soportados | No disponible en la información proporcionada. La familia Gemma es multilingüe, pero este repositorio no detalla cobertura |
| Licencia | Gemma Terms of Use (la model card indica `license: gemma`); el campo de licencia del repositorio en HuggingFace figura como no disponible |
| Formato de pesos | GGUF cuantizado (tags del repositorio: `gguf`), más fichero `mmproj` para el proyector multimodal; el conteo de parámetros procede de metadatos safetensors |
| Tamano del repositorio | 2,9 GB |
| Autoria | `pleasen` (repack de terceros); modelo base desarrollado por Google DeepMind |
| Fecha de publicación | Creado el 2026-09-23, actualizado el 2026-09-23 |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Gemma 4, con entrada de texto e imagen y salida de texto. Las fuentes consultadas indican que Gemma 4 incorpora razonamiento, contexto largo, soporte de system prompts y uso nativo de herramientas, y que los modelos pequeños de la familia admiten además entrada de audio. Sobre esa base, este repositorio aplica tres modificaciones explícitas: supresión de los encoders de audio para reducir el peso total, cuantización de las capas de visión a Q8_0 o Q4_K_M, y conversión de los embeddings posicionales de FP32 a FP16 para rebajar tamano conservando más precisión que las capas de visión cuantizadas. El resultado declarado es un `mmproj-BF16` de aproximadamente el 14 % (Q4_K_M) o el 20 % (Q8_0) del original.

No se detalla en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El sufijo QAT del nombre indica que el modelo base se entrenó con quantization-aware training, de modo que las cuantizaciones posteriores deberían degradar menos la calidad que una cuantización post-hoc equivalente. La variante IT implica ajuste por instrucciones. La innovación técnica destacable de este repositorio no está en el entrenamiento, sino en el empaquetado: recorte de modalidades completas (audio) y cuantización asimétrica de los componentes multimodales para abaratar el despliegue en dispositivo.

## Capacidades

- Generación de texto conversacional multi-turno en la variante instruction-tuned, con soporte de system prompts.
- Entrada de imagen y razonamiento visual, siempre que se cargue el fichero `mmproj` junto con los pesos cuantizados.
- Razonamiento (reasoning) y modo de pensamiento, según la descripción de la familia Gemma 4 en las fuentes consultadas.
- Uso nativo de herramientas (tool calling / function calling), mencionado en la ficha de LM Studio para la familia Gemma 4.
- Capacidades de agente y razonamiento multi-paso derivadas del soporte de herramientas del modelo base.
- Ejecución en CPU para la variante E2B, según gemma4.dev, con contexto de 8 000 tokens.
- Capacidades multilingües: no disponibles con detalle en la información proporcionada.
- Audio: expresamente eliminado en este repack; el modelo no puede procesar entrada de audio pese a que otros modelos pequeños de Gemma 4 sí lo hacen.

## Casos de uso

- Asistente conversacional en dispositivo móvil: el repositorio pesa 2,9 GB y emplea cuantización GGUF, por lo que puede cargarse en un teléfono de gama alta o en un SoC con aceleración NPU. Encaja en aplicaciones que requieren respuestas sin conexión y sin enviar conversaciones a un servidor.
- Procesamiento de documentos escaneados con privacidad: cargando el `mmproj` cuantizado, el modelo puede hacer preguntas y respuestas sobre imágenes y OCR ligero directamente en el dispositivo, lo que evita transferir documentos confidenciales a la nube y simplifica el cumplimiento del RGPD.
- Enrutado de intenciones en pipelines de agentes: por su tamano reducido y su soporte de tool calling, puede actuar como clasificador o router que decide qué herramienta o modelo mayor invocar en cada turno, reduciendo el coste por petición.
- Asistencia al desarrollador en entornos aislados: en máquinas air-gapped o con políticas estrictas de salida de datos, un modelo de este tamano permite autocompletado, explicación de fragmentos y generación de pruebas sin depender de APIs externas. La calidad específica en código no está documentada en la información disponible.
- Tutoría y educación offline: con 8 000 tokens de contexto (según gemma4.dev) y ejecución en CPU, es viable desplegarlo en portátiles escolares o tablets sin conectividad para resolución de dudas y generación de ejercicios.
- Automatización industrial e IoT: en controladores y pasarelas edge, el modelo puede generar resúmenes de telemetría, responder consultas de operarios o clasificar incidencias en lenguaje natural con latencia local y sin coste de red.
- Preprocesado y etiquetado de datos a escala: al ejecutarse en CPU, permite tareas de anonimización, resumen o filtrado de grandes volúmenes de texto en clústeres sin GPU, a un coste energético bajo por documento.
- Atención al cliente con contexto corto: puede gestionar conversaciones multi-turno dentro de su ventana de contexto, aunque las cifras publicadas (8 000 tokens) limitan los historiales muy largos y hacen recomendable un resumen incremental del diálogo.
- Tareas de audio: descartadas explícitamente, porque este repack elimina los encoders de audio del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye tabla de evaluaciones (MMLU, GSM8K, HumanEval, MMMU u otras) y las páginas de terceros consultadas tampoco aportan cifras numéricas comparables.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir del recuento de parámetros, no cifras publicadas por el autor): en Q4_K_M, del orden de 2,6 a 3,0 GB de pesos más caché KV; en Q8_0, alrededor de 4,9 GB; en FP16/BF16, unos 9,3 GB. Con un contexto de 8 000 tokens, la caché KV anade unos cientos de MB.
- Cabe en GPU de consumo: cualquier GPU con 6 GB o más puede ejecutar la cuantización Q4_K_M; 8 GB permiten Q8_0 con contexto completo. Modelos como RTX 3060 12 GB, RTX 4060, RTX 4070 o superiores son suficientes.
- Ejecución en CPU: la variante E2B está descrita como capaz de funcionar íntegramente en CPU, lo que abre la puerta a mini-PC, portátiles sin GPU dedicada y placas tipo Raspberry Pi 5 con resultados de velocidad no documentados.
- Aceleración en dispositivo: existe una ficha oficial de Gemma-4-E2B-it en Qualcomm AI Hub, lo que indica soporte de despliegue en hardware Snapdragon.
- Opciones de despliegue: llama.cpp y `llama-server` (formato nativo GGUF, cargando el `mmproj` para visión), Ollama y LM Studio para uso local, y servicios compatibles con endpoints de HuggingFace, según el tag `endpoints_compatible` del repositorio. vLLM tiene soporte limitado de GGUF, por lo que no es la opción natural para esta build.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidades | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| pleasen/Gemma-4-E2B-IT-QAT (esta ficha) | 4 628 569 635 según safetensors; ~2,1 B citados por terceros | 8 000 tokens según gemma4.dev (no confirmado) | Texto + visión; audio eliminado | GGUF (Q4_K_M, Q8_0) + mmproj | Gemma Terms of Use | Repositorio de terceros, 0 descargas y 0 likes en la consulta |
| google/gemma-4-E2B-it-qat-mobile-transformers | No disponible | No disponible | Texto + imagen (audio según la familia) | Transformers / safetensors | Gemma | Repositorio oficial de Google |
| google/gemma-4-e2b-qat (distribuido vía LM Studio) | No disponible | "Contexto largo" sin cifra | Texto + imagen, razonamiento, tool use | GGUF / runtime LM Studio | Gemma | Build oficial QAT |
| Gemma 4 E2B (descripción de gemma4.dev) | ~2,1 mil millones | 8 000 tokens | Solo texto según esta fuente (en contradicción con otras) | No disponible | Gemma | No disponible |

Las fuentes consultadas se contradicen en un punto relevante: gemma4.dev describe Gemma 4 E2B como modelo solo texto, mientras que Qualcomm AI Hub y LM Studio lo describen como multimodal con entrada de imagen. No hay confirmación oficial en la información disponible para resolver la discrepancia.

## Limitaciones y advertencias

- Repack de terceros: el autor es `pleasen`, no Google DeepMind. No hay garantía de que las cuantizaciones se hayan validado frente al modelo original, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.
- Verificación de integridad: al proceder de un tercero, conviene comprobar hashes y probar el modelo antes de usarlo en producción.
- Audio deshabilitado: los encoders de audio se han eliminado, de modo que cualquier caso de uso con voz o sonido queda fuera de alcance.
- Pérdida de precisión en visión: las capas visuales están cuantizadas a Q4_K_M o Q8_0, lo que puede degradar tareas de OCR fino, detección de objetos pequeños o lectura de tablas complejas respecto al modelo sin cuantizar.
- Discrepancia en el recuento de parámetros: 4,63 mil millones en safetensors frente a los ~2,1 mil millones que citan otras fuentes para E2B. Afecta directamente a las estimaciones de VRAM y a la planificación de despliegue.
- Idioma y contexto: no se documenta cobertura de idiomas ni se confirma la ventana de contexto. Si el limite real es de 8 000 tokens, los casos con documentación extensa requerirán troceado o resumen previo.
- Alucinación: no se han publicado evaluaciones de fidelidad ni tasas de alucinación para este repack. En modelos de este tamano el riesgo es apreciable en tareas de recuperación factual y cálculo.
- Licencia: la model card indica `license: gemma`, por lo que se aplican los términos de uso de Gemma, incluida su política de usos prohibidos. El campo de licencia del repositorio en HuggingFace aparece como no disponible, lo que puede complicar la verificación automática del cumplimiento.
- Uso comercial: al no estar confirmada la licencia a nivel de metadatos del repositorio, conviene revisar los términos de Gemma antes de integrar el modelo en un producto.
- Sin benchmarks: no hay datos publicados de MMLU, GSM8K, HumanEval ni evaluaciones multimodales, de modo que no es posible comparar su calidad real con alternativas sin evaluarlo uno mismo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/pleasen/Gemma-4-E2B-IT-QAT
- Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Repositorio oficial de referencia: https://huggingface.co/google/gemma-4-E2B-it-qat-mobile-transformers
- Ficha de Gemma 4 E2B QAT en LM Studio: https://lmstudio.ai/models/google/gemma-4-e2b-qat
- Descripción de Gemma 4 E2B en gemma4.dev: https://gemma4.dev/models/gemma-4-e2b
- Ficha de Gemma-4-E2B-it en Qualcomm AI Hub: https://aihub.qualcomm.com/models/gemma_4_e2b_it

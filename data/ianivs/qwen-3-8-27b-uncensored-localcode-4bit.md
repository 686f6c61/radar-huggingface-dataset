# ianivs/Qwen-3.8-27B-Uncensored-LocalCode-4bit

## Resumen

`ianivs/Qwen-3.8-27B-Uncensored-LocalCode-4bit` es una conversión no oficial de un modelo Qwen de 27.000 millones de parámetros, en su variante "uncensored" (sin los filtros de seguridad habituales), al formato `.ckpt` propietario que utiliza la aplicación Local Code en macOS. El autor, `ianivs`, no tiene relación con el equipo de Qwen ni con el desarrollador de Local Code, y publica el artefacto como reemplazo directo del fichero de pesos que la aplicación distribuye de serie. El resultado es un fichero de unos 21,3 GB que sustituye a la versión stock de "Qwen 3.8 27B (4-bit S)" dentro de la app.

La relevancia de esta ficha es limitada pero concreta: no se trata de un modelo nuevo ni de un entrenamiento original, sino de un artefacto de conversión y cuantización pensado para un runtime cerrado y específico (Local Code sobre Apple Silicon). La model card es explícita sobre la cadena de transformaciones: los pesos de texto provienen de un build uncensored de Qwen 3.8 27B, se cuantizaron a 4 bits con oMLX y después se recodificaron al formato de Local Code, con una doble cuantización que introduce pérdida de precisión adicional. Los pesos de visión, en cambio, se copiaron sin modificar del modelo stock de la aplicación.

El dato más problemático es la trazabilidad: el autor reconoce que no registró la fuente original, de modo que se desconoce el modelo upstream exacto y, por tanto, su licencia. Esto convierte al artefacto en material de uso experimental y local, no apto para producción ni para redistribución sin una verificación legal previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.8; detalles de atención y capas no disponibles) |
| Parametros totales | 27 000 millones (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (doble cuantización: oMLX 4-bit y recodificación al formato `.ckpt` de Local Code) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `unknown-source-license` (licencia del modelo upstream desconocida) |
| Formato de pesos | `.ckpt` propietario de Local Code (fichero de 21 348 925 440 bytes) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna más allá de la pertenencia a la familia Qwen 3.8 y del tamaño de 27 000 millones de parámetros. La model card no documenta número de capas, tipo de atención, composición del dataset de preentrenamiento, número de tokens vistos ni si hubo fases de alineación mediante RLHF o DPO. Tampoco se especifica qué modificación concreta convierte al modelo en "uncensored": puede tratarse de un fine-tuning con datos sin filtrar, de una ablación de capas de rechazo o de otra técnica, pero el autor no lo detalla.

Lo que sí está documentado es el proceso de conversión, que constituye la única innovación técnica del artefacto. Los pesos de texto se cuantizaron a 4 bits con oMLX y luego se recodificaron al formato `.ckpt` de Local Code; los pesos de visión se copiaron byte a byte del fichero stock. El autor reporta verificaciones de integridad: los 883 tensores de texto coinciden con el origen con una similitud coseno mínima de 0,992, y los 441 tensores de visión son idénticos byte a byte al fichero original. El punto débil declarado es el tensor `mtp.fc`, que se convirtió con una precisión notablemente peor (18 dB frente a 27 dB o más en el resto). El conversor se distribuye en la carpeta `converter` bajo licencia MIT.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo Qwen 3.8 27B subyacente.
- Lectura de imágenes: los pesos de visión se conservan intactos respecto al modelo stock de Local Code, por lo que la capacidad multimodal se mantiene.
- Uso de herramientas (tool calling) dentro de Local Code: la aplicación permite que el modelo ejecute herramientas sobre el Mac del usuario.
- Comportamiento con menos rechazos: al partir de un build uncensored, la tasa de negativas a peticiones sensibles es menor que en el modelo alineado original.
- Generación de código: la etiqueta `local-code` y el propósito del artefacto apuntan a asistencia de programación dentro de la aplicación.
- Capacidades multilingües: no documentadas en la información disponible.

## Casos de uso

- Asistencia de programación local en macOS: el artefacto se instala como reemplazo del modelo stock de Local Code y permite generar y revisar código sin salir del equipo, con la ventaja de que los datos no abandonan la máquina. Es adecuado para desarrolladores que ya usan la aplicación y quieren un comportamiento menos restrictivo.
- Experimentación con modelos sin alineación de seguridad: investigadores que estudian tasas de rechazo, sesgos o comportamientos emergentes pueden comparar este build con el stock sobre las mismas entradas, aprovechando que ambos comparten arquitectura y pesos de visión.
- Pruebas de robustez de pipelines de agentes: al permitir tool calling sobre el sistema local, sirve para evaluar cómo se comporta un agente con menos salvaguardas antes de decidir qué modelo desplegar en un entorno controlado.
- Análisis de imágenes en local: la conservación byte a byte de los tensores de visión permite tareas de descripción o extracción de información de capturas y diagramas sin conexión.
- Docencia y demostraciones sobre cuantización: el proceso documentado (oMLX a 4 bits y recodificación) y las métricas de similitud coseno por tensor son un caso práctico para explicar la pérdida de precisión en cadenas de cuantización múltiple.
- Evaluación comparativa de formatos propietarios: útil para medir el coste real, en calidad y en tamaño, de empaquetar un modelo de 27B en un contenedor cerrado de 21 GB frente a formatos abiertos como GGUF o safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta verificaciones de integridad de la conversión: similitud coseno mínima de 0,992 en los 883 tensores de texto, coincidencia byte a byte en los 441 tensores de visión, y una precisión de 18 dB en `mtp.fc` frente a 27 dB o más en el resto. También se indica que el fichero cargó correctamente en un Apple M5 Max con 48 GB de RAM, sin datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM/RAM unificada: el fichero pesa 21,3 GB; en Apple Silicon se necesita al menos esa cantidad libre, y el autor lo probó con 48 GB de memoria unificada en un M5 Max.
- GPU recomendadas: el artefacto está diseñado exclusivamente para Local Code sobre Apple Silicon; no se documenta soporte en GPU NVIDIA o AMD.
- GPU de consumo: no aplica en el sentido habitual, ya que el formato `.ckpt` no es compatible con llama.cpp, vLLM ni Ollama. En Mac, un equipo con 32 GB unificados quedaría muy justo; 48 GB o más es el escenario validado.
- Opciones de despliegue: únicamente la aplicación Local Code en macOS, con el fichero nombrado exactamente `qwen_3.8_27b_i4x.ckpt` dentro de `~/Library/Containers/com.liuliu.local-code/Data/Documents/Models`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| `ianivs/Qwen-3.8-27B-Uncensored-LocalCode-4bit` | 27B | no disponible | `.ckpt` (Local Code) | desconocida | Solo Local Code en macOS |
| Qwen 3.8 27B stock (4-bit S) de Local Code | 27B | no disponible | `.ckpt` (Local Code) | la de Local Code | Solo Local Code en macOS |
| Build uncensored original de Qwen 3.8 27B | 27B | no disponible | no disponible | desconocida | no disponible |

La comparación con alternativas abiertas de tamaño similar (por ejemplo, variantes de 27B-32B en GGUF para llama.cpp) no es posible con los datos disponibles, ya que no se conocen ni el contexto ni los benchmarks del modelo base.

## Limitaciones y advertencias

- Trazabilidad inexistente: el autor no registró la fuente original, por lo que se desconoce el modelo upstream exacto y su licencia. No es apto para uso comercial sin una auditoría legal previa.
- Comportamiento de seguridad reducido: al derivar de un build uncensored, produce menos rechazos y puede generar contenido dañino o inexacto; la responsabilidad de uso recae en el usuario.
- Riesgo de alucinación: no evaluado formalmente; la doble cuantización a 4 bits puede degradar la fidelidad respecto al modelo original.
- Acceso a herramientas del sistema: en Local Code el modelo puede ejecutar herramientas sobre el Mac, lo que amplifica el impacto de cualquier comportamiento erróneo o malicioso.
- Fragilidad de la instalación: una actualización o una nueva descarga de la aplicación puede sobrescribir el fichero, y el nombre debe ser exacto o la app no lo reconocerá.
- Precisión desigual en la conversión: el tensor `mtp.fc` se convirtió con solo 18 dB de precisión, un punto débil declarado por el propio autor.
- Idiomas y contexto sin documentar: no se puede garantizar el comportamiento multilingüe ni aprovechar la ventana de contexto completa sin verificación empírica.
- Sin adopción: cero descargas y cero likes en el momento de la consulta, sin evaluación formal más allá de la prueba de carga del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ianivs/Qwen-3.8-27B-Uncensored-LocalCode-4bit
- Carpeta del conversor (MIT), incluida en el repositorio: `converter/` dentro del mismo repo de HuggingFace
- Local Code (aplicación anfitriona): no se proporciona URL en la información disponible
- Documentación de Qwen: no se proporciona URL en la información disponible

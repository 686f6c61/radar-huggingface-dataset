# diegodamian/facturas-s20-gemma-4-e2b-litertlm

## Resumen

Facturas S20 es un ajuste fino de `google/gemma-4-E2B-it` orientado a la extracción estructurada de datos de facturas y boletas electrónicas peruanas a partir de una fotografía, ejecutándose íntegramente en el dispositivo y sin conexión. Lo desarrolla el usuario de HuggingFace `diegodamian` como artefacto de la aplicación Android homónima y se distribuye empaquetado en formato `.litertlm` para el runtime LiteRT-LM de Google AI Edge, lo que permite su despliegue en teléfonos Android sin infraestructura de servidor.

El modelo parte de la familia Gemma 4 en su variante E2B instruction-tuned, un transformer multimodal de tipo image-text-to-text con aproximadamente 2 mil millones de parámetros efectivos (la nomenclatura E2B de Google corresponde a esa escala; el dato exacto de parámetros totales no se detalla en la información disponible). Sobre esa base se aplicó un LoRA (`lora_v2_768`) entrenado con Unsloth sobre pesos en 4 bits durante 3 épocas y posteriormente fusionado sobre los pesos en 16 bits.

Su relevancia práctica es doble: por un lado, demuestra el flujo completo de adaptación de un modelo multimodal pequeño a una tarea documental muy concreta (OCR estructurado de comprobantes SUNAT) con un dataset de solo 120 fotos reales; por otro, ilustra el pipeline de conversión a LiteRT-LM con cuantización `dynamic_wi8_afp32` para inferencia on-device. El contexto de trabajo es de 1024 tokens (`cache_length`), suficiente para una imagen más una instrucción corta y una respuesta JSON compacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Gemma 4 E2B instruction-tuned) |
| Parametros totales | no disponible (variante E2B de Gemma 4; el autor no publica el recuento exacto) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1024 tokens (`cache_length` del `.litertlm`) |
| Tipos de cuantizacion | Texto y embebedores a 8 bits (`dynamic_wi8_afp32`); codificador de visión heredado del `.litertlm` oficial de `litert-community/gemma-4-E2B-it-litert-lm` |
| Idiomas soportados | es (español; orientado a documentos peruanos) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamaño 5.294.460.128 bytes (4,93 GiB), SHA-256 `8859bdc56068c353ef45adcf333cd94041dea2ea58eba0f3adb145149aed4ab4` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `google/gemma-4-E2B-it`: un transformer multimodal que acepta imagen y texto y genera texto, con un codificador de visión separado del decodificador lingüístico. El ajuste fino no modifica la topología, sino que añade adaptadores LoRA sobre la torre de lenguaje y los fusiona después sobre los pesos en 16 bits. La conversión final a `.litertlm` se realizó con `litert-torch`, cuantizando texto y embebedores a 8 bits en modo `dynamic_wi8_afp32` y reutilizando el codificador de visión del paquete oficial de la comunidad LiteRT para Gemma 4 E2B.

El entrenamiento se hizo con Unsloth sobre el modelo cargado en 4 bits, durante 3 épocas, conservando el checkpoint con menor pérdida de validación y calculando la pérdida únicamente sobre la respuesta. El dataset consta de 120 fotografías de comprobantes reales de 19 emisores peruanos, divididas por emisor para evitar fuga de información: 58 para entrenamiento, 21 para validación y 41 para prueba. Las imágenes se procesaron a 768 px en el lado mayor y se recortaron al papel. El dataset no se publica por contener datos de terceros. La instrucción de extracción es fija y forma parte del contrato de entrenamiento: desviarse de ella puede hacer que el modelo revierta al comportamiento del modelo base.

## Capacidades

- Extracción de campos estructurados desde imagen de comprobante: `ruc`, `razon_social`, `serie`, `numero`, `fecha_emision` (formato YYYY-MM-DD), `moneda` (PEN o USD) e `importe_total` con dos decimales, incluyendo percepción cuando la hay.
- Salida en JSON plano y compacto en una sola línea, con `null` para campos ilegibles.
- Comprensión de imagen (image-text-to-text) limitada al dominio documental de facturas y boletas electrónicas peruanas.
- Ejecución on-device y offline mediante LiteRT-LM, sin llamadas a red.
- Manejo de valores monetarios y fechas con normalización de formato en la respuesta.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento extendido ni audio en la información disponible.

## Casos de uso

- Digitalización de gastos en campo: un comercial fotografía la factura en el móvil y la app extrae los campos para registrarlos en el sistema de gastos sin conexión, útil en zonas sin cobertura.
- Prellenado de formularios contables: el JSON devuelto se mapea directamente a los campos del ERP o de la hoja de cálculo, reduciendo la captura manual a una revisión y confirmación.
- Concurrencia de gastos (rendición de cuentas): el trabajador acumula comprobantes durante un viaje y el modelo procesa cada foto localmente, con la revisión humana posterior antes de guardar.
- Verificación cruzada con el QR de SUNAT: la app corrige los campos extraídos con los datos del código QR cuando este es legible, usando el modelo como extractor principal y el QR como fuente de validación.
- Automatización de la recepción de facturas de proveedores: en un flujo móvil de captura, el modelo clasifica y estructura el comprobante antes de enviarlo al sistema de cuentas por pagar, con la ventaja de no exponer documentos a servicios en la nube.
- Prototipado de pipelines OCR estructurados: sirve como referencia reproducible para adaptar un modelo multimodal pequeño a un dominio documental con pocos ejemplos y desplegarlo en Android con LiteRT-LM.
- Auditoría y control interno: al ejecutarse en el dispositivo, los comprobantes no salen del terminal, lo que facilita el cumplimiento de políticas de privacidad en el tratamiento de datos fiscales.

## Benchmarks y rendimiento

Exactitud por campo reportada por el autor para el `.litertlm`, medida en la CPU de un PC con fotos recortadas a 768 px. El conjunto de prueba es pequeño (32 fotos de proveedor nuevo y 9 de proveedor conocido), por lo que cada acierto o fallo mueve varios puntos porcentuales.

| Campo | Proveedor nuevo (32 fotos) | Proveedor conocido (9 fotos) |
|---|---|---|
| ruc | 78 % | 100 % |
| razon_social | 22 % | 67 % |
| serie | 72 % | 100 % |
| numero | 66 % | 78 % |
| fecha_emision | 50 % | 56 % |
| moneda | 100 % | 100 % |
| importe_total | 38 % | 67 % |

El autor indica que el modelo supera al Gemma 4 E2B oficial sin afinar en casi todos los campos, pero que no alcanza el 90 % de exactitud en ninguno de los campos críticos salvo `moneda` y, en proveedor conocido, `ruc` y `serie`. En un Motorola Moto G34 5G, con CPU y visión en GPU, la latencia medida es de aproximadamente 32 segundos por lectura y un consumo de unos 3,5 GB de memoria.

## Requisitos de hardware

- VRAM/memoria: aproximadamente 3,5 GB de memoria en el dispositivo medido (Moto G34 5G), coherente con un archivo de 4,93 GiB cuantizado a 8 bits en texto y embebedores.
- GPU recomendadas: no aplica en el escenario objetivo; el despliegue es en CPU de Android con la visión opcionalmente en GPU. Para pruebas en escritorio, el autor reporta ejecución en CPU de PC.
- Cabe en GPU de consumo: no disponible como dato medido; el formato `.litertlm` está pensado para LiteRT-LM, no para cargarse con CUDA.
- Opciones de despliegue: LiteRT-LM (runtime oficial de Google AI Edge) en Android; el flujo de conversión documentado usa `litert-torch`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: ~32 s por lectura en Moto G34 5G (CPU + GPU para visión). No se reporta throughput agregado ni latencia en otros dispositivos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Facturas S20 (este modelo) | no disponible (base E2B) | 1024 tokens | Extracción de facturas peruanas on-device | Apache 2.0 | HuggingFace, formato `.litertlm` |
| `google/gemma-4-E2B-it` | no disponible (E2B) | no disponible en la información | Modelo base multimodal instruction-tuned | Gemma (uso permitido, con términos) | HuggingFace |
| `litert-community/gemma-4-E2B-it-litert-lm` | no disponible (E2B) | no disponible en la información | Versión oficial empaquetada para LiteRT-LM | Gemma | HuggingFace |

La comparación cuantitativa frente al modelo base sin afinar solo se ofrece de forma cualitativa en la model card ("supera al modelo oficial sin afinar en casi todos los campos"), sin tabla de cifras del base. No se dispone de comparaciones con otros extractores documentales.

## Limitaciones y advertencias

- Exactitud insuficiente para automatización sin supervisión: `razon_social` (22 % en proveedor nuevo) e `importe_total` (38 %) son especialmente débiles; el propio autor exige revisión humana antes de guardar.
- Degradación con proveedores no vistos: la brecha entre proveedor conocido y nuevo es grande en casi todos los campos, lo que indica sobreajuste al conjunto de 19 emisores del entrenamiento.
- Sensibilidad a la instrucción: el prompt de extracción es fijo; con otra formulación el modelo puede revertir al comportamiento del modelo base y romper el formato JSON.
- Repetición degenerativa: el autor advierte que el modelo puede quedarse repitiendo ceros en `numero`, por lo que recomienda cortar la generación a 200 tokens.
- Contexto corto: 1024 tokens limitan la entrada a una imagen y una instrucción breve, sin margen para prompts largos ni conversaciones multi-turno.
- Dominio estrecho: solo documentos peruanos, en español, y solo los siete campos definidos; no es un OCR general ni un extractor de tablas o líneas de detalle.
- Evaluación limitada: el conjunto de prueba es de 41 fotos en total, por lo que las cifras tienen alta varianza y no deben extrapolarse a producción sin una validación propia.
- Dataset no publicado: no es posible reproducir el entrenamiento ni auditar la composición de los datos.
- Licencia: Apache 2.0 según el autor, igual que Gemma 4; conviene verificar los términos de uso de Gemma aplicables al modelo base antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/diegodamian/facturas-s20-gemma-4-e2b-litertlm
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Paquete oficial LiteRT-LM de Gemma 4 E2B: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Unsloth (herramienta de entrenamiento LoRA): https://github.com/unslothai/unsloth

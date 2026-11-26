# experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT-GGUF

## Resumen

LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT-GGUF es una compilación en formato GGUF del modelo experimental LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT, publicado por el usuario experimentalmachines. Se trata de un ajuste fino (SFT) del modelo vision-lenguaje LFM3-VL-2B de LiquidAI, orientado a la actuación como agente de interfaz gráfica (GUI agent) sobre capturas de pantalla de teléfonos Android. El modelo recibe un objetivo en inglés y una imagen de pantalla, y produce la siguiente acción a ejecutar (toque, deslizamiento, escritura, etc.).

Con 1.728.801.600 parámetros reales (etiquetado comercialmente como "2B"), arquitectura multimodal transformer con torre de visión y proyector, y una ventana de contexto de servicio de 8192 tokens según la configuración recomendada de llama-server, el modelo está pensado para ejecutarse en dispositivos móviles o en hardware de consumo mediante cuantización de 4 bits.

Es relevante porque ejemplifica el patrón de modelos pequeños y especializados para automatización de interfaces en el borde (edge), pero su propio autor lo marca explícitamente como **modelo de desarrollo**: falló su puerta de validación offline y no se ejecutó en el benchmark AndroidWorld. La model card recomienda usar la variante LFM3-VL-2B-MobileAgent en su lugar. Se conserva únicamente para reproducibilidad de resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) con torre de visión y proyector; base LFM3-VL-2B |
| Parametros totales | 1.728.801.600 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configuración de servicio recomendada con `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (modelo de lenguaje); Q8_0 (proyector de visión `mmproj`) |
| Idiomas soportados | en (inglés) |
| Licencia | LFM Open License v1.0 (lfm1.0), heredada de LiquidAI/LFM3-VL-2B |
| Formato de pesos | GGUF (dos ficheros: `LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT-Q4_K_M.gguf` y `mmproj-LFM3-VL-2B-Q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo parte de LFM3-VL-2B de LiquidAI, un transformer multimodal con torre de visión que procesa capturas de pantalla y las proyecta al espacio del modelo de lenguaje mediante un proyector (`mmproj`). El ajuste fino SFT se realizó sobre el checkpoint base `LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT`; según la model card, el fine-tune **no modificó la torre de visión**, por lo que el proyector GGUF es idéntico al de LiquidAI/LFM3-VL-2B-GGUF.

El entrenamiento se basó exclusivamente en demostraciones grabadas ("recorded demonstrations"); el modelo nunca interactuó con un teléfono real durante el entrenamiento. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a GGUF se realizó con llama.cpp `cd959bae9` mediante `convert_hf_to_gguf.py` (F16) y posterior `llama-quantize Q4_K_M`. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de acciones de agente GUI a partir de una captura de pantalla y un objetivo en lenguaje natural (image-text-to-text).
- Comprensión de imágenes de pantalla de Android (screenshots) para localizar elementos y decidir la siguiente interacción.
- Razonamiento de un solo paso por captura: el formato de servicio recomendado usa `--image-max-tokens 1024` y `--reasoning-format deepseek`.
- Formato conversacional (`conversational`) y compatible con endpoints de inferencia.
- Capacidad multilingüe limitada al inglés (objetivos en inglés).
- No se documenta soporte de tool calling, function calling, agentes multi-paso autónomos, audio ni otras modalidades más allá de imagen y texto.

## Casos de uso

- Investigación en agentes GUI móviles: reproducción de experimentos de SFT sobre LFM3-VL-2B con el dataset MemGUIContinuedSFT, comparando el comportamiento del checkpoint de desarrollo frente a la versión estable.
- Automatización de pruebas de interfaz en Android en entornos controlados: el modelo puede generar la acción esperada dado un objetivo y una captura, útil para validar flujos de UI en laboratorio.
- Prototipado de asistentes de accesibilidad: dado un objetivo en inglés y una captura, sugerir la siguiente acción al usuario (siempre con supervisión humana).
- Evaluación de cuantización Q4_K_M en modelos visión-lenguaje pequeños: permite medir la degradación de precisión frente a los pesos bf16 originales en tareas de grounding visual.
- Despliegue en dispositivo de borde: con Q4_K_M y proyector Q8_0, el modelo cabe en hardware móvil o de consumo mediante llama.cpp, útil para estudiar latencia y consumo en edge.
- Docencia y experimentación con pipelines de conversión GGUF: sirve como ejemplo reproducible de conversión HF→GGUF→cuantización con separación de proyector de visión.
- Reproducción de resultados de investigación: la model card indica que se conserva precisamente para reproducir los números offline obtenidos con los pesos bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el modelo "falló su puerta de validación offline" (offline gate) y que **no fue ejecutado en AndroidWorld**; los números offline que aparecen en la model card del checkpoint padre provienen de los pesos bf16, no de esta compilación GGUF.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 1,3 GB; con Q4_K_M del modelo de lenguaje más el proyector Q8_0, la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM. No se dispone de cifras oficiales de VRAM pico.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, es viable en RTX 3060/4060 y superiores; también en GPUs integradas o CPU.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU consumer moderna con al menos ~4 GB de VRAM; también es apto para ejecución en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server` con `--mmproj` para el proyector de visión. Comando recomendado en la model card:
  `llama-server -m ...Q4_K_M.gguf --mmproj mmproj-LFM3-VL-2B-Q8_0.gguf -c 8192 --image-max-tokens 1024 --reasoning-format deepseek -np 1 -ngl 99`
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Estado |
|---|---|---|---|---|---|
| LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT-GGUF (este) | 1,73 B | 8192 | Imagen + texto | LFM Open License v1.0 | Desarrollo, no recomendado |
| LFM3-VL-2B-MobileAgent | no disponible | no disponible | Imagen + texto | LFM Open License v1.0 (presumible) | Estable, recomendado por el autor |
| LiquidAI/LFM3-VL-2B (base) | ~2 B (etiqueta) | no disponible | Imagen + texto | LFM Open License v1.0 | Base generalista |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Modelo de desarrollo**: el autor indica explícitamente que no se recomienda su uso y que debe emplearse LFM3-VL-2B-MobileAgent en su lugar.
- **Falló la puerta de validación offline** y no fue evaluado en AndroidWorld; no hay garantías de calidad en tareas reales de agente.
- Solo admite objetivos en inglés y una captura de pantalla por paso.
- Entrenado únicamente con demostraciones grabadas; nunca interactuó con un teléfono real durante el entrenamiento.
- Riesgo de alucinación en la identificación de elementos de la interfaz y en la generación de acciones; no debe usarse sin supervisión.
- **No permitir que actúe de forma desatendida** en un teléfono con cuentas, mensajes o pagos reales (advertencia textual del autor).
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial; la model card la etiqueta como `license: other`.
- No se documentan sesgos específicos, pero al ser un modelo entrenado solo en inglés y sobre capturas de Android, su generalización a otras plataformas o idiomas es limitada.
- Sin datos publicados de benchmarks ni de latencia/throughput para esta compilación GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT-GGUF
- Checkpoint padre (bf16): https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT
- Variante recomendada: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent
- Modelo base de LiquidAI (GGUF): https://huggingface.co/LiquidAI/LFM3-VL-2B-GGUF
- Modelo base de LiquidAI: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent
- Documentación de modelos del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/models.md
- Resultados del proyecto: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/results.md
- Guía de nomenclatura: https://github.com/ExperimentalMachines/lfm3-mobile-agent/blob/main/docs/naming.md
- Licencia: https://huggingface.co/experimentalmachines/LFM3-VL-2B-MobileAgent-Dev-MemGUIContinuedSFT-GGUF/blob/main/LICENSE

# optimum-intel-internal-testing/tiny-random-minicpm-ocr-jev

## Resumen

`optimum-intel-internal-testing/tiny-random-minicpm-ocr-jev` es un modelo de pruebas interno publicado por el equipo de optimum-intel en Hugging Face. No es un modelo entrenado para uso real: es una versión reducida y con pesos aleatorios de la arquitectura `Qwen3_5ForConditionalGeneration`, generada a partir de la configuración del modelo `openbmb/MiniCPM-OCR-Jev` con el objetivo de validar pipelines de inferencia, exportación y cuantización en un entorno ligero.

El modelo conserva la topología de la arquitectura original (atención híbrida con capas de atención lineal gated-delta-net y capas de atención completa, además de una torre de visión) pero con dimensiones drásticamente reducidas: hidden size de 64, cuatro capas, cuatro cabezas de atención y una torre de visión de dos capas. El resultado son 32.233.032 parámetros en float32, lo que permite ejecutarlo en CPU en segundos.

Su relevancia es exclusivamente de ingeniería: sirve como fixture para tests de integración de optimum-intel, validación de configuraciones de transformers y comprobación de rutas de código de modelos multimodales imagen-texto. No debe confundirse con un modelo funcional de OCR ni usarse en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido multimodal (atención lineal + atención completa) con torre de visión, clase `Qwen3_5ForConditionalGeneration` |
| Parametros totales | 32.233.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (según `max_position_embeddings` de la config tiny) |
| Tipos de cuantizacion | no disponible (pesos en float32; el repo no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura replica la de `Qwen3_5ForConditionalGeneration` con parámetros escalados a la baja. El componente de texto usa cuatro capas con un patrón de tipos `["linear_attention", "linear_attention", "linear_attention", "full_attention"]`, es decir, tres capas de atención lineal (gated-delta-net) y una capa de atención completa, manteniendo la mezcla del modelo original. Emplea 4 cabezas de atención con 2 cabezas KV (GQA), head dim de 32 y RoPE parcial con `partial_rotary_factor` de 0.25 y `mrope_section` de `[2, 1, 1]`. El vocabulario se preserva completo (248.320 tokens) para que el tokenizador real y los tokens especiales de imagen/vídeo sigan siendo válidos.

La torre de visión tiene profundidad 2, hidden size 64, 4 cabezas, patch size 16, spatial merge size 2 y 256 embeddings posicionales (grid 16x16). El `out_hidden_size` coincide con el hidden size del texto para permitir la fusión de embeddings visuales en el espacio del decodificador.

No hay entrenamiento: los pesos se inicializan aleatoriamente con semilla 42 (`torch.manual_seed(SEED)`). No se ha aplicado RLHF, DPO ni preentrenamiento alguno. El script de generación incluido en la model card documenta el proceso completo de construcción, con presupuestos máximos de 40 millones de parámetros y 180 MB, y fuerza `dtype=float32` en todos los niveles de configuración para garantizar un forward robusto en CPU.

## Capacidades

- No dispone de capacidades funcionales reales: los pesos son aleatorios, por lo que cualquier salida generada es ruido estadístico sin valor semántico.
- Conserva la interfaz multimodal imagen-texto de la arquitectura original (tokens especiales de imagen, vídeo, vision-start y vision-end), lo que permite probar rutas de código de fusión visión-lenguaje.
- Soporta la carga mediante `AutoConfig`, `AutoProcessor` y `GenerationConfig` de transformers, con el procesador (tokenizador, image processor y chat template) copiado del modelo original.
- Sirve como fixture para validar exportación a otros formatos y pipelines de optimum-intel.
- No soporta tool calling, agentes ni razonamiento multi-paso de forma útil, al carecer de entrenamiento.
- El tokenizador subyacente es el real de `openbmb/MiniCPM-OCR-Jev`, por lo que la tokenización de texto e imágenes es correcta aunque el modelo no sepa interpretarla.

## Casos de uso

- Tests de integración en optimum-intel: el modelo se usa como fixture para verificar que las rutas de exportación (ONNX, OpenVINO) funcionan con la arquitectura `Qwen3_5ForConditionalGeneration` sin necesidad de descargar el modelo completo.
- Validación de configuraciones de transformers: permite comprobar que `AutoConfig` y `AutoProcessor` cargan correctamente la topología híbrida de atención lineal y completa, incluyendo los parámetros de RoPE parcial y mrope.
- Pruebas de CI/CD en pipelines de modelos multimodales: al ocupar 0,1 GB y ejecutarse en CPU, se puede incluir en suites de tests que validen el forward de imagen-texto en cada commit.
- Verificación de guardado y recarga de safetensors: el script de la model card comprueba que el marcador de caché, el `model_type` y la lista de `architectures` sobreviven al ciclo `save_pretrained`/`from_pretrained`.
- Desarrollo de herramientas de inspección de modelos: útil para probar scripts que analizan configuraciones anidadas (`text_config`, `vision_config`) y detectan inconsistencias de tipos.
- Reproducción de bugs de la arquitectura original: al mantener la misma clase y estructura de configuración, permite aislar problemas de código sin la sobrecarga de memoria del modelo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al tratarse de un modelo con pesos aleatorios, cualquier métrica de calidad (MMLU, HumanEval, GSM8K, OCR) sería equivalente a azar y no tendría significado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 130 MB en float32 (32,2 M parámetros × 4 bytes), más overhead de activaciones y del procesador de imágenes.
- GPU recomendadas: ninguna en particular; funciona en cualquier GPU con más de 1 GB de memoria, incluidas iGPU.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 3050, RTX 4090) y en CPU sin problemas.
- Opciones de despliegue: transformers en CPU o GPU, y potencialmente exportación a ONNX/OpenVINO mediante optimum-intel (objetivo del repo). No se publican artefactos GGUF ni recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles de forma oficial; por tamaño, el forward en CPU debería completarse en decenas de milisegundos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| tiny-random-minicpm-ocr-jev | 32,2 M | 4096 | apache-2.0 | Fixture de test interno |
| openbmb/MiniCPM-OCR-Jev | no disponible en la información | no disponible | no disponible | Modelo OCR real (origen de la config) |
| Otros `tiny-random-*` de optimum-intel | variable | variable | apache-2.0 | Fixtures de test para distintas arquitecturas |

La comparación con modelos funcionales de OCR no es pertinente: este artefacto solo comparte arquitectura con `MiniCPM-OCR-Jev`, no capacidades. Frente a otros fixtures de optimum-intel, la diferencia está en la arquitectura cubierta (híbrida lineal/completa con visión), no en rendimiento.

## Limitaciones y advertencias

- Los pesos son aleatorios: las salidas no tienen ningún valor semántico y no deben interpretarse como OCR, descripción de imágenes ni generación de texto.
- No ha recibido entrenamiento, por lo que no se le pueden atribuir sesgos aprendidos, pero tampoco garantías de comportamiento.
- No apto para producción bajo ninguna circunstancia: es un artefacto de test interno.
- La licencia apache-2.0 permite uso comercial del artefacto, pero su utilidad comercial es nula.
- El contexto de 4096 tokens corresponde a la configuración reducida, no al modelo original.
- La información sobre idiomas y cuantizaciones no está publicada; no debe asumirse compatibilidad con herramientas de cuantización sin verificación previa.
- El nombre del repo incluye `internal-testing`, lo que indica que puede cambiar o desaparecer sin aviso.

## Enlaces

- Hugging Face: https://huggingface.co/optimum-intel-internal-testing/tiny-random-minicpm-ocr-jev
- Modelo original de referencia: https://huggingface.co/openbmb/MiniCPM-OCR-Jev
- Repositorio de optimum-intel: https://github.com/huggingface/optimum-intel
- Documentación de transformers sobre Qwen3.5: no disponible en la información proporcionada

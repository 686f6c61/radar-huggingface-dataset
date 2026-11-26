# sebekblessing/klein-4b-gpu

## Resumen

`sebekblessing/klein-4b-gpu` es un empaquetado del modelo de generación de imágenes texto-a-imagen FLUX.2 [klein] 4B de Black Forest Labs, redistribuido por el usuario sebekblessing en formato GGUF específico para el motor Anima GPU Engine. No se trata de un modelo nuevo ni de un ajuste fino: los pesos subyacentes son los de FLUX.2 [klein] 4B (3.889.921.536 parámetros según los safetensors del repo base), pero reempaquetados en un layout propietario del motor que permite ejecutarlos sobre la GPU integrada de teléfonos Android mediante OpenCL estándar.

El problema que resuelve es la imposibilidad práctica de ejecutar un modelo de difusión de casi 4.000 millones de parámetros en hardware móvil con los formatos habituales (safetensors, GGUF de llama.cpp o ComfyUI). Este repositorio proporciona los ficheros ya convertidos al formato del motor Anima, junto con los componentes auxiliares necesarios: el decodificador de imágenes TAE f2, su codificador para edición, y el lector de prompts Qwen3-4B cuantizado a 8 bits que se ejecuta en la CPU del teléfono.

Es relevante ahora porque demuestra una vía de despliegue local de modelos de difusión de gama media en dispositivos de consumo, sin depender de la nube. El repo ocupa 12,7 GB y acumula 253 descargas en cuatro días desde su publicación (19 de noviembre de 2026), lo que indica interés pero también un ecosistema todavía incipiente: cero likes y un único autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión texto-a-imagen (FLUX.2 [klein] 4B); pesos reempaquetados para Anima GPU Engine |
| Parámetros totales | 3.889.921.536 (modelo de dibujo); el repo incluye además Qwen3-4B (~4B) como lector de prompts y los módulos TAE f2 |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (aplica al lector de prompts Qwen3-4B, no especificada en la información) |
| Tipos de cuantización | 8 bits (Q8) para el modelo de dibujo y el lector de prompts; layout GGUF propio del motor, no compatible con llama.cpp ni ComfyUI |
| Idiomas soportados | no disponible (los prompts se procesan vía Qwen3-4B, multilingüe, pero no se documenta) |
| Licencia | Apache 2.0 (modelo base FLUX.2 [klein] 4B); TAE f2 bajo MIT; Qwen3-4B bajo Apache 2.0 |
| Formato de pesos | GGUF en layout propietario de Anima GPU Engine (`klein_q8.gguf`, `tae_f2.gguf`, `taee_f2.gguf`, `klein_reader.gguf`) |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX.2 [klein] 4B, un modelo de difusión texto-a-imagen de Black Forest Labs con aproximadamente 3.890 millones de parámetros. La información disponible no detalla la arquitectura interna del modelo base (tipo de backbone, mecanismo de atención, variante de flow matching o scheduler), por lo que esos datos deben consultarse en la model card original de `black-forest-labs/FLUX.2-klein-4B`. Tampoco se documentan aquí el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO.

La contribución técnica de este repositorio es el reempaquetado. Los scripts `build/pack_klein.py` y `build/pack_tae.py` convierten los pesos originales al layout que espera Anima GPU Engine, un motor que ejecuta la inferencia sobre la GPU del teléfono mediante OpenCL estándar. El pipeline se descompone en cuatro piezas: el modelo de dibujo en 8 bits, el decodificador de imágenes TAE f2 (versión ligera del VAE de Flux 2, obra de madebyollin), el codificador TAE para tareas de edición, y el lector de prompts Qwen3-4B en Q8_0 que corre en la CPU con llama.cpp. Esta separación CPU/GPU es la innovación práctica: el modelo de lenguaje que interpreta el prompt no compite por la memoria de la GPU con el modelo de difusión.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (pipeline `text-to-image`).
- Edición de imágenes: el repo incluye `taee_f2.gguf`, el codificador TAE f2 necesario para flujos de edición sobre una imagen de entrada.
- Interpretación de prompts mediante Qwen3-4B, lo que aporta comprensión de instrucciones en lenguaje natural más rica que un codificador de texto CLIP/T5 clásico.
- Ejecución en GPU móvil vía OpenCL en dispositivos Android sin chip Snapdragon AI.
- Variante específica para Snapdragon 8 Elite mediante el paquete separado `klein-4b-qnn-8elite` (no incluido en este repo).
- Integración con la app Anima: descarga gestionada de ficheros desde el apartado Model Management.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modos de pensamiento; es un modelo generativo de imágenes, no un LLM conversacional.

## Casos de uso

- Generación de imágenes offline en Android: el paquete está pensado para que la app Anima dibuje con la GPU del teléfono sin conexión a internet, útil en entornos con conectividad limitada o por privacidad de los prompts.
- Prototipado de apps móviles de creación visual: un desarrollador puede integrar Anima GPU Engine y validar la calidad de FLUX.2 [klein] 4B en gama alta Android antes de decidir si construye su propio pipeline.
- Edición de fotos en dispositivo: gracias a `taee_f2.gguf`, el flujo permite modificar imágenes existentes con instrucciones textuales sin subirlas a un servidor.
- Demostraciones y ferias técnicas: mostrar generación de imágenes por difusión corriendo íntegramente en un móvil es un caso de uso realista para equipos de marketing técnico y evangelización.
- Investigación sobre eficiencia en inferencia móvil: el repo sirve como referencia de cuantización a 8 bits y de partición CPU/GPU para modelos de difusión de ~4B parámetros.
- Evaluación comparativa de motores OpenCL: permite medir latencia y calidad frente a otras alternativas de despliegue móvil (QNN en Snapdragon, NNAPI, etc.) usando los mismos pesos base.
- Base para empaquetados propios: los scripts `pack_klein.py` y `pack_tae.py` documentan el procedimiento para adaptar otros modelos FLUX.2 al layout de Anima.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score), latencia por imagen ni throughput en dispositivos concretos.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repo ocupa 12,7 GB en total, pero incluye varios ficheros; el modelo de dibujo en Q8 más el decodificador TAE y el lector Qwen3 deben caber simultáneamente en la memoria gráfica compartida del SoC.
- GPU recomendadas: GPU integrada de teléfonos Android con soporte OpenCL estándar; variante específica para Snapdragon 8 Elite mediante `klein-4b-qnn-8elite`.
- Compatibilidad con GPU de escritorio (A100, H100, RTX 4090): no documentada; el layout GGUF propietario no es compatible con llama.cpp ni ComfyUI, por lo que no se puede cargar en los runners habituales de PC.
- Opciones de despliegue: exclusivamente Anima GPU Engine (app Anima en Android). No soporta vLLM, llama.cpp, Ollama ni TGI, salvo el componente Qwen3-4B que sí es el GGUF estándar `Qwen3-4B-Q8_0.gguf` y podría ejecutarse con llama.cpp en CPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sebekblessing/klein-4b-gpu | ~3,89B (difusión) + Qwen3-4B (texto) | no disponible | GGUF propietario Anima | Apache 2.0 | Hugging Face, 253 descargas |
| black-forest-labs/FLUX.2-klein-4B | ~3,89B | no disponible | safetensors (presumiblemente) | Apache 2.0 | Hugging Face (modelo base oficial) |
| klein-4b-qnn-8elite | no disponible | no disponible | no disponible | no disponible | Paquete específico para Snapdragon 8 Elite |

No se dispone de datos de benchmarks ni de modelos de difusión móviles directamente comparables en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- El formato GGUF es propietario del motor Anima: no es cargable en llama.cpp, ComfyUI ni en los runners estándar de difusión, lo que limita su reutilización fuera de la app Anima.
- Dependencia total de un motor de terceros (Anima GPU Engine) mantenido por un único desarrollador; riesgo de abandono o cambios incompatibles de layout.
- La cuantización a 8 bits puede degradar la calidad de imagen frente a los pesos originales en safetensors; no se han publicado comparativas de fidelidad.
- El lector de prompts Qwen3-4B en Q8_0 añade consumo de CPU y memoria; en teléfonos de gama media el rendimiento puede ser insuficiente.
- No hay información sobre sesgos del modelo base ni sobre riesgos de generación de contenido inapropiado; FLUX.2 [klein] 4B hereda los sesgos y limitaciones de su dataset de entrenamiento, no documentados aquí.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original y de la app Anima antes de distribuir un producto.
- Cero likes y un único autor: no hay validación comunitaria de la calidad del empaquetado ni de la reproducibilidad de los scripts.
- Los idiomas soportados no están documentados; la calidad con prompts en castellano no está verificada.
- Fecha de creación en 2026 y actualización cuatro días después: ecosistema muy reciente, con posible inestabilidad en la app y en los ficheros.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sebekblessing/klein-4b-gpu
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Motor Anima GPU Engine: https://github.com/adiirfan/anima-gpu-engine
- Lector de prompts Qwen3-4B GGUF: https://huggingface.co/Qwen/Qwen3-4B-GGUF
- Variante para Snapdragon 8 Elite: `klein-4b-qnn-8elite` (referenciada en la model card, sin URL directa en la información disponible)

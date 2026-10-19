# caikybaldo999/zyvideo-0.1

## Resumen

ZYVIDEO 0.1 es un modelo de generación de vídeo a partir de texto (text-to-video) publicado por el usuario caikybaldo999 en HuggingFace. Se trata de un DiT (Diffusion Transformer) de 119,5 millones de parámetros entrenado desde cero sobre OpenVid-1M, capaz de generar clips de 256×256 píxeles y 33 fotogramas (aproximadamente 2,7 segundos según el autor). El modelo utiliza flow matching como método de muestreo y mantiene congelados dos componentes preentrenados de terceros: el VAE de Wan2.2 y el codificador de texto Qwen3-0.6B.

Su interés principal no es la calidad final, sino la receta: demuestra que es posible entrenar un generador de vídeo funcional desde cero en una única GPU NVIDIA L4 (24 GB de VRAM), siguiendo la estela de MiniDance. Es, por tanto, un modelo de referencia para investigación de bajo presupuesto, experimentos de ablation y docencia, no un modelo listo para producción.

El repositorio es muy ligero (0,5 GB), no registra descargas ni interacciones, no declara licencia ni idiomas soportados, y no incluye resultados de benchmarks. La información disponible procede únicamente de la model card del autor.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con muestreo por flow matching; VAE de Wan2.2 y codificador de texto Qwen3-0.6B congelados |
| Parametros totales | 119,5 M (solo el DiT; el VAE y el codificador de texto son componentes externos preentrenados) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (modelo de difusion; no se documenta la ventana de prompt del codificador Qwen3-0.6B) |
| Tipos de cuantizacion | No disponible (no se documentan pesos cuantizados ni versiones GGUF/ONNX) |
| Idiomas soportados | No disponible (no se declara ningun idioma; el codificador Qwen3-0.6B es multilingue, pero el soporte real del modelo no esta verificado) |
| Licencia | No disponible |
| Formato de pesos | PyTorch (checkpoint nativo de la libreria pytorch; el formato exacto de los ficheros no se especifica). Tamano del repositorio: 0,5 GB |
| Resolucion de video | 256 × 256 pixeles |
| Duracion / fotogramas | 33 fotogramas (aprox. 2,7 s segun el autor) |
| Dataset de entrenamiento | OpenVid-1M |
| Hardware de entrenamiento | 1 × NVIDIA L4 |

## Arquitectura y entrenamiento

El modelo sigue el esquema de difusión latente con backbone transformer (DiT) y formulación de flow matching, una alternativa a la predicción de ruido epsilon que interpola linealmente entre ruido y datos y suele converger con menos pasos de muestreo. El espinazo generativo es un DiT de 119,5 M de parámetros entrenado desde cero, mientras que la codificación visual (VAE de Wan2.2) y la codificación textual (Qwen3-0.6B) se reutilizan congeladas, de modo que todo el presupuesto de entrenamiento se dedica al generador latente.

El entrenamiento se realizó con OpenVid-1M, un corpus de aproximadamente un millón de clips con subtítulos, sobre una única GPU NVIDIA L4. La receta está inspirada en MiniDance (JuniverseLi/minidance). La información disponible no detalla el número de tokens o pasos vistos, la composición exacta del dataset tras el filtrado, la resolución de entrenamiento frente a la de inferencia, ni si se aplicaron técnicas de ajuste posteriores como preferencias (DPO) o destilación de pasos. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal; a este tamaño, el coste de atención sobre 33 fotogramas a 256×256 es manejable sin optimizaciones exóticas.

## Capacidades

- Generación de vídeo a partir de texto: produce clips de 33 fotogramas a 256×256 píxeles condicionados por un prompt en lenguaje natural.
- Muestreo por flow matching: pipeline de difusión con integración de flujo, integrable en el ecosistema PyTorch.
- Seguimiento de prompts mediante un codificador de texto Qwen3-0.6B preentrenado (no ajustado durante el entrenamiento del DiT, según la model card).
- Reutilización de un VAE preentrenado de Wan2.2 para comprimir y reconstruir el vídeo en el espacio latente.
- Capacidad limitada a texto→vídeo: no se documenta image-to-video, vídeo→vídeo, control por pose o máscaras.
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje, sino un generador de difusión.
- No genera audio ni admite entrada de audio.
- No se documentan capacidades multilingües verificadas ni modo "thinking".

## Casos de uso

- Investigación en entrenamiento de bajo presupuesto: sirve como caso de referencia reproducible de un T2V entrenado en una sola L4, útil para estudiar qué calidad se obtiene con 119,5 M de parámetros y un millón de clips.
- Experimentos de ablation sobre flow matching: al ser un modelo pequeño y con repo de 0,5 GB, permite iterar sobre schedulers, número de pasos y escalado del condicionamiento textual con coste mínimo.
- Docencia y divulgación: ilustra de forma completa el pipeline difusión latente + DiT + VAE + codificador de texto en un entorno manejable en una clase o taller.
- Previsualización creativa (previz): generación de clips de 2,7 s a baja resolución para explorar composiciones, encuadres y ritmo antes de producir con modelos mayores.
- Generación de datos sintéticos de vídeo: clips cortos y de baja resolución para aumentar datasets de tareas auxiliares (clasificación de movimiento, detección temporal) donde no se requiere fotorrealismo.
- Base para fine-tuning: punto de partida para ajustar un generador de vídeo a dominios concretos (animación simple, patrones sintéticos, estilos gráficos) con recursos limitados.
- Pruebas de integración en demos Gradio: el autor publica un Space de demostración, lo que facilita evaluar latencia y comportamiento en un servicio web mínimo.
- Comparación de recetas frente a MiniDance: permite medir empíricamente diferencias de calidad y estabilidad temporal entre dos recetas de entrenamiento con la misma filosofía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FVD, CLIP score, VBench ni comparaciones cuantitativas con otros generadores, y la búsqueda web realizada no aportó documentación técnica adicional (únicamente resultados no relacionados).

## Requisitos de hardware

- Pesos del DiT: 119,5 M de parámetros, aproximadamente 0,48 GB en fp32 (coincide con el tamaño del repo de 0,5 GB) y 0,24 GB en bf16/fp16 (estimación a partir del recuento de parámetros).
- Componentes congelados adicionales: Qwen3-0.6B añade del orden de 1,2 GB en bf16 (2,4 GB en fp32); el VAE de Wan2.2 suma un peso no cuantificado en la información disponible.
- VRAM estimada para inferencia: en torno a 3-5 GB en bf16 incluyendo pesos y activaciones para 33 fotogramas a 256×256 (estimación, no medida publicada).
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta con 8 GB o más (RTX 3060 Ti, 4060 Ti, 4070, 4080, 4090). No se ha verificado en GPUs de 6 GB.
- GPU de referencia para entrenamiento: NVIDIA L4 (24 GB), una sola unidad, según el autor.
- Opciones de despliegue: script PyTorch propio (librería pytorch declarada) y demo Gradio en HuggingFace Spaces. No hay soporte documentado en vLLM, TGI, llama.cpp, Ollama ni Diffusers, al no tratarse de un modelo de lenguaje ni de un pipeline estándar publicado.
- Latencia y throughput: no disponibles. No se documentan tiempos por clip, número de pasos de muestreo ni rendimiento en fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / duracion | Dataset | Licencia | Notas |
|---|---|---|---|---|---|
| ZYVIDEO 0.1 | 119,5 M (DiT) | 256×256, 33 fotogramas | OpenVid-1M | No disponible | Entrenado desde cero en 1 × L4; VAE Wan2.2 y Qwen3-0.6B congelados |
| MiniDance (JuniverseLi) | No disponible en la informacion | No disponible | No disponible | No disponible | Receta que inspira a ZYVIDEO 0.1; referencia directa de comparacion |
| Wan2.2 (familia, origen del VAE) | No disponible en la informacion (la variante TI2V publica se denomina 5B) | Superior a 256×256 (no verificado aqui) | No disponible | No disponible en esta ficha | Solo se reutiliza su VAE; el generador de ZYVIDEO no deriva de sus pesos |
| Wan2.1 T2V 1.3B | Aprox. 1.300 M (segun denominacion publica) | Superior a 256×256 (no verificado aqui) | No disponible | No disponible en esta ficha | Un orden de magnitud mas de parametros; no comparable en calidad esperada |

No se dispone de datos verificados de benchmarks ni de especificaciones completas de los modelos alternativos dentro de la informacion proporcionada; la comparacion es, por tanto, estructural y no de rendimiento.

## Limitaciones y advertencias

- Resolucion muy baja (256×256) y duracion muy corta (33 fotogramas, ~2,7 s): no apto para entregables comerciales de vídeo.
- Sin audio, sin control temporal fino, sin image-to-video ni condicionamiento estructural.
- Ausencia total de licencia declarada: no hay permiso explícito de uso comercial, lo que bloquea su adopción en producción hasta que el autor lo aclare.
- Sin benchmarks ni evaluacion cualitativa objetiva: la calidad real es desconocida más allá de la demo publicada.
- Riesgo elevado de incoherencia temporal y de alucinacion visual, habitual en modelos pequenos entrenados desde cero con 119,5 M de parametros.
- Sesgos no documentados: OpenVid-1M es un corpus web de clips con subtitulos, por lo que puede arrastrar sesgos demograficos, culturales y de estilo, ademas de contenido inapropiado no filtrado segun la informacion disponible.
- Idiomas no declarados: el rendimiento con prompts en castellano no esta verificado; el codificador Qwen3-0.6B esta mayoritariamente orientado a ingles y chino.
- Repositorio sin descargas ni validacion de la comunidad (0 descargas, 0 likes): no hay evidencia externa de reproducibilidad.
- Empaquetado poco documentado: no se especifican ficheros de pesos, script de inferencia, versiones de dependencias ni pasos de muestreo recomendados, lo que complica la reproduccion.
- Metadatos inconsistentes: la fecha de creacion declarada (2026-10-18) es posterior a la fecha habitual de consulta, lo que sugiere un posible error de registro.
- La busqueda web no devolvio documentacion tecnica relevante (solo resultados no relacionados), por lo que no se pudo contrastar la model card con fuentes independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/caikybaldo999/zyvideo-0.1
- Demo (Space Gradio): https://huggingface.co/spaces/caikybaldo999/zyvideo
- Receta de referencia MiniDance: https://huggingface.co/JuniverseLi/minidance
- Dataset OpenVid-1M: mencionado en la model card, sin enlace proporcionado en la informacion disponible
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada

# frankleeeee/CausalForcing-Long-Wan2.1-T2V-1.3B-Diffusers

## Resumen

El modelo `CausalForcing-Long-Wan2.1-T2V-1.3B-Diffusers` es una conversión a formato Diffusers del checkpoint de generación de video largo (minutos) denominado Causal Forcing, desarrollado por el usuario frankleeeee. Se trata de una adaptación del modelo base Wan-AI/Wan2.1-T2V-1.3B que incorpora el framework Rolling Forcing de TencentARC, reentrenado desde la inicialización ODE de Causal Forcing. Su objetivo principal es permitir la generación de videos de larga duración (nivel minuto) manteniendo coherencia temporal, algo que los modelos de difusión estándar no logran con ventanas cortas de pocos segundos.

La arquitectura emplea una ventana de atención deslizante con un bloque de attention-sink de 3 frames y un buffer de claves/valores (KV) de 24 latentes, con una ventana de atención de 21 frames. El modelo tiene aproximadamente 1,42 mil millones de parámetros y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial y modificación. La relevancia actual radica en que ofrece una solución de código abierto para generación de video de larga duración, un campo dominado por soluciones propietarias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rolling Forcing (diffusion con ventana deslizante) |
| Parametros totales | 1.418.996.800 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (ventana de atencion de 21 frames sobre buffer KV de 24 latentes) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en el framework Rolling Forcing, que extiende el enfoque de Causal Forcing para generación de video largo. La arquitectura es un modelo de difusión con un mecanismo de denoising conjunto por ventana deslizante: se procesa una ventana de 21 frames latentes (de un buffer total de 24) de forma iterativa, y un bloque de attention-sink de 3 frames actúa como ancla temporal para mantener coherencia global. Este diseño permite generar secuencias de video de longitud arbitraria sin necesidad de reiniciar el proceso de denoising completo.

El entrenamiento se realizó reutilizando la inicialización ODE del checkpoint de Causal Forcing (`zhuhz22/Causal-Forcing`, pesos `generator_ema`), pero reentrenado bajo el marco de Rolling Forcing. Los componentes no transformativos (VQ-VAE, texto-encoder, etc.) se copian directamente del modelo base `Wan-AI/Wan2.1-T2V-1.3B-Diffusers`. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el uso de RLHF/DPO en la información disponible.

## Capacidades

- Generación de video de larga duración (más de un minuto) a partir de texto en inglés.
- Coherencia temporal mejorada mediante ventana deslizante y buffer KV de 24 latentes.
- Compatibilidad con el pipeline `WanRollingForcingPipeline` de la librería Diffusers.
- Integración con el runtime de difusión de SGLang para despliegue eficiente.
- Soporte de resolución y número de frames configurables (ejemplo: 832x480, 321 frames).
- No se especifican capacidades de tool calling, agentes o razonamiento multi-step; se trata de un modelo puramente generativo de video.

## Casos de uso

- **Producción de contenido audiovisual**: el modelo permite generar videos de hasta un minuto de duración con un solo prompt, útil para creadores de contenido en plataformas como YouTube o TikTok que necesitan material de stock personalizado.
- **Prototipado rápido en diseño**: diseñadores y equipos de marketing pueden generar escenas de producto o ambientes virtuales sin necesidad de rodaje, reduciendo costes de preproducción.
- **Educación y formación**: creación de videos explicativos o simulaciones visuales para cursos, tutoriales y material didáctico, manteniendo una narrativa coherente durante más tiempo.
- **Publicidad y marketing**: generación de anuncios de video cortos pero con duración extendida para campañas multicanal, donde la coherencia de la marca es crítica.
- **Investigación en visión por computador**: los investigadores pueden usar el modelo para generar datasets sintéticos de video largo, evaluando la estabilidad temporal de otros modelos de visión.
- **Entretenimiento y arte generativo**: artistas y desarrolladores pueden explorar narrativas visuales largas y experimentar con estilos, aprovechando la licencia Apache 2.0 para integraciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo base `Wan-AI/Wan2.1-T2V-1.3B` requiere 8.19 GB de VRAM según la documentación oficial. El checkpoint de Rolling Forcing añade un buffer KV adicional y procesamiento por ventanas, por lo que el consumo real será superior, aunque no se ha especificado un valor exacto.
- **GPU recomendadas**: compatible con GPUs de consumo como NVIDIA RTX 3090, 4090, o A100/H100 para producción. Dado el tamaño (1.42B parámetros), cabe en tarjetas con 12-24 GB de VRAM si se usa cuantización, aunque no hay cuantizaciones publicadas para este checkpoint.
- **Despliegue**: el modelo se usa mediante el runtime de difusión de SGLang o la pipeline `WanRollingForcingPipeline` de Diffusers. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- **Latencia y throughput**: no disponibles. La generación de 321 frames a 832x480 es computacionalmente intensiva; se recomienda GPU con al menos 16 GB de VRAM para uso interactivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `frankleeeee/CausalForcing-Long-Wan2.1-T2V-1.3B-Diffusers` | 1.42B | 21 frames (ventana) | Apache 2.0 | HuggingFace |
| `Wan-AI/Wan2.1-T2V-1.3B-Diffusers` | 1.3B | 5 segundos (81 frames) | Apache 2.0 | HuggingFace |
| `Wan-AI/Wan2.1-VACE-1.3B` | 1.3B | 5 segundos (81 frames) | Apache 2.0 | HuggingFace |

La principal diferencia es la capacidad de generar videos de más de un minuto frente a los 5 segundos del modelo base. No hay otros modelos de código abierto comparables para generación de video de larga duración en el momento de esta ficha.

## Limitaciones y advertencias

- **Sesgos**: no se han documentado sesgos específicos, pero el modelo hereda los sesgos del dataset de entrenamiento del modelo base Wan2.1, que no se ha detallado.
- **Riesgo de alucinación**: como generador de video, puede producir escenas visualmente plausibles pero físicamente inconsistentes o con objetos irreales, especialmente en prompts complejos.
- **Limitaciones de contexto**: la ventana de atención de 21 frames (sobre buffer de 24) puede degradar la coherencia en videos de más de un minuto, ya que la memoria a largo plazo está limitada al attention-sink.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero es necesario verificar que los componentes base (Wan2.1) mantienen la misma licencia.
- **Estado experimental**: el modelo tiene 0 descargas y 0 likes en HuggingFace, lo que indica que es una conversión reciente y no probada en producción. No hay garantías de estabilidad.
- **Idiomas**: no se especifican idiomas soportados; el prompt de ejemplo está en inglés, y el modelo base Wan2.1 es multilingüe (chino e inglés), pero no se confirma para este checkpoint.

## Enlaces

- [HuggingFace - frankleeeee/CausalForcing-Long-Wan2.1-T2V-1.3B-Diffusers](https://huggingface.co/frankleeeee/CausalForcing-Long-Wan2.1-T2V-1.3B-Diffusers)
- [Modelo base - Wan-AI/Wan2.1-T2V-1.3B-Diffusers](https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers)
- [Repositorio Causal-Forcing (THU-ML)](https://github.com/thu-ml/Causal-Forcing)
- [Repositorio RollingForcing (TencentARC)](https://github.com/TencentARC/RollingForcing)
- [Diffusers pipeline Wan (GitHub)](https://github.com/huggingface/diffusers/blob/main/src/diffusers/pipelines/wan/pipeline_wan.py)

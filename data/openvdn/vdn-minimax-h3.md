# OpenVDN/vdn-minimax-h3

## Resumen

VDN-Minimax-H3 (VDN-H3) es un modelo de generacion de video texto-a-video desarrollado por OpenVDN, que introduce una arquitectura de atencion hibrida para acelerar la inferencia de modelos de difusion de video. Se basa en el modelo MiniMax-H3 de MiniMax, un modelo omni-modal de generacion que produce video con audio nativo hasta 2K y 15 segundos. VDN-H3 anade una rama de atencion lineal frame-wise junto a la rama softmax original, logrando una generacion mas rapida que la reproduccion del video sin sacrificar calidad visual.

El checkpoint liberado incluye el modelo base completo (72 GB), un adaptador LoRA para 50 pasos de denoising y otro para 8 pasos, ademas del codigo de inferencia y entrenamiento optimizado. En 8 GPUs B200, VDN-H3 genera un clip de 14,4 segundos en 11,23 segundos con 8 pasos, lo que supone una aceleracion de aproximadamente 12x frente al modelo denso original. El proyecto es totalmente open-source, con pesos, codigo y scripts de despliegue publicados en GitHub y HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: atencion lineal frame-wise + atencion softmax (sobre MiniMax-H3) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 (scripts de inferencia incluidos) |
| Idiomas soportados | No disponible |
| Licencia | MiniMax H3 Community License Agreement (con restricciones territoriales) |
| Formato de pesos | Safetensors (model.safetensors, adapter_model.safetensors) |

## Arquitectura y entrenamiento

VDN-H3 parte de los pesos del transformer de MiniMax-H3 y anade una rama de atencion lineal que procesa los frames de forma independiente, complementando la rama softmax que mantiene la coherencia visual global. Esta arquitectura hibrida reduce el coste computacional por paso de denoising. El entrenamiento se realiza en dos etapas: una primera etapa (stage-b) con 50 pasos de denoising, y una segunda etapa de destilacion (stage-dmd) que reduce a 8 pasos mediante un adaptador LoRA adicional. Los adaptadores LoRA se pueden fusionar en el backbone durante la inferencia sin modificar los pesos originales. El codigo de entrenamiento e inferencia esta optimizado con FlashAttention y Triton, e incluye soporte para FP8.

## Capacidades

- Generacion de video a partir de prompts de texto (text-to-video).
- Inferencia rapida con 8 pasos de denoising (modelo destilado) o 50 pasos (modelo base).
- Soporte de cuantizacion FP8 para reducir el uso de memoria y acelerar el calculo.
- Arquitectura hibrida que preserva la calidad visual del modelo base.
- Compatible con el pipeline de Diffusers y con scripts de inferencia propios.
- No se documentan capacidades de tool calling, agentes ni razonamiento multimodal en esta version.

## Casos de uso

- Produccion de video en tiempo real: VDN-H3 puede generar clips de 14,4 segundos en 11,23 segundos con 8 GPUs B200, lo que permite iterar rapidamente en entornos de produccion donde la velocidad es critica.
- Generacion de contenido promocional para marketing: los equipos creativos pueden producir multiples variantes de un anuncio en minutos, ajustando prompts y reescribiendolos con el VLM Qwen3-VL-32B incluido en el flujo.
- Creacion de clips para redes sociales: la generacion de videos cortos de alta calidad con audio nativo (heredado del modelo base) es adecuada para plataformas como TikTok o Instagram Reels.
- Prototipado en estudios de animacion: los directores pueden previsualizar escenas rapidamente antes de la produccion final, reduciendo costes de renderizado.
- Investigacion en modelos de difusion de video: al ser open-source, permite estudiar la arquitectura hibrida y los metodos de destilacion para futuros desarrollos.
- Integracion en pipelines de postproduccion: el modelo puede conectarse a flujos de trabajo existentes mediante los scripts de inferencia o adaptarse a ComfyUI (el modelo base MiniMax-H3 ya tiene soporte nativo).

## Benchmarks y rendimiento

La model card publica velocidades de denoising en estado estacionario para la generacion de video 768p de 14,4 segundos. No se proporcionan metricas de calidad (FVD, CLIP score, etc.).

**H200:**

| Configuracion | GPUs | Segundos/NFE | 50 NFE (VDN-H3-50-step) | 8 NFE (VDN-H3-8-step) |
|---|---:|---:|---:|---:|
| Denso MiniMax-H3 | 1 | 32,7 | 27,3 min | 4,4 min |
| VDN-H3 FP8 | 1 | 11,2 | 9,4 min | 90,5 s |
| VDN-H3 FP8 distribuido | 8 | 2,29 | 1,9 min | 18,3 s |

**B200:**

| Configuracion | GPUs | Segundos/NFE | 50 NFE (VDN-H3-50-step) | 8 NFE (VDN-H3-8-step) |
|---|---:|---:|---:|---:|
| Denso MiniMax-H3 (cuDNN) | 1 | 16,74 | 13,95 min | 2,23 min |
| VDN-H3 FP8 | 1 | 6,41 | 5,3 min | 51 s |
| VDN-H3 FP8 distribuido | 8 | 1,40 | 1,2 min | 11,23 s |

Los tiempos excluyen carga del modelo, warm-up, decodificacion VAE y codificacion MP4. Para despliegue en vivo se recomienda ejecutar el reescritor de prompts, la decodificacion VAE y la conversion MP4 en maquinas separadas.

## Requisitos de hardware

- VRAM estimada: no especificada, pero el repositorio pesa 82,8 GB (modelo base 72 GB + adaptadores). Se requiere al menos una GPU con 80 GB de VRAM para la configuracion FP8 de una sola GPU.
- GPUs recomendadas: H200 o B200 (mencionadas en las tablas de rendimiento). No se indica compatibilidad con GPUs de consumo (RTX 4090, etc.).
- Despliegue: se proporcionan scripts de inferencia propios (`infer.py`, `encode_prompt.py`) y configuraciones YAML. El modelo base MiniMax-H3 tiene soporte en ComfyUI, pero no se confirma para VDN-H3.
- Latencia: 11,23 s para un clip de 14,4 s con 8 pasos en 8 B200; 90,5 s en una sola H200 con 8 pasos.
- Throughput: no se proporcionan metricas de tokens por segundo, solo tiempos de denoising.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Velocidad (8 NFE, 1 GPU) | Licencia |
|---|---|---|---|---|---|
| VDN-H3 (este) | Hibrida (lineal + softmax) | No disponible | No disponible | 90,5 s (H200) | MiniMax H3 Community (restrictiva) |
| MiniMax-H3 (base) | Transformer denso | No disponible | No disponible | 4,4 min (H200) | MiniMax H3 Community (restrictiva) |
| Open-Sora (referencia) | Transformer difusion | No disponible | No disponible | No disponible | Apache 2.0 (varia por version) |

La comparativa se limita a la velocidad de denoising con el modelo base, ya que no se dispone de datos de otros modelos de video open-source en la informacion proporcionada. VDN-H3 ofrece una aceleracion de aproximadamente 3x en una sola GPU y 12x en 8 GPUs frente a MiniMax-H3 denso.

## Limitaciones y advertencias

- Licencia restrictiva: el acuerdo MiniMax H3 Community License excluye el uso en la Union Europea, el Reino Unido, la Republica de Corea y los Estados Unidos. El uso fuera del territorio aplicable no esta autorizado; se debe contactar con MiniMax para obtener una licencia en esas regiones.
- Requisitos de hardware elevados: para alcanzar las velocidades publicadas se necesitan GPUs de centro de datos (H200/B200). En GPUs de consumo la inferencia puede ser inviable por VRAM.
- Sin informacion sobre sesgos o alucinaciones: la model card no documenta evaluaciones de sesgo, robustez ni riesgos de generacion de contenido inapropiado.
- Dependencia de un VLM externo: el flujo de inferencia requiere codificar los prompts con Qwen3-VL-32B, lo que anade un componente adicional al pipeline.
- No se especifican idiomas soportados: la generacion de video puede depender del prompt, pero no hay garantias de rendimiento multilingue.
- El modelo base MiniMax-H3 tiene capacidades omni-modales (texto, imagen, video, audio), pero VDN-H3 se centra en video; no se confirma que herede todas las funcionalidades del base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenVDN/vdn-minimax-h3
- Codigo (GitHub): https://github.com/OpenVDN/vdn-minimax-h3
- Modelo base MiniMax-H3 (HuggingFace): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Blog de MiniMax sobre H3: https://www.minimax.io/blog/minimax-h3
- Repositorio oficial de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Hub de recursos de MiniMax-H3 (ComfyUI): https://github.com/ai-models-lab/minimax-h3
- Tutoriales y despliegue: https://design.minimax.io/h3

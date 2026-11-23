# Bhoidy/nyx-image-26m

## Resumen

Nyx Image 26M (`NyxImage26M`) es un modelo de difusión discreta enmascarada (masked discrete diffusion, MDLM) de tipo transformer, desarrollado por Bhoidy bajo el paraguas de Sednium Technologies, especializado en la generación de sprites de pixel art retro de 16×16 píxeles a partir de descripciones textuales. Con 26,34 millones de parámetros, se posiciona como una alternativa ultraligera a los modelos de difusión latente convencionales, prescindiendo por completo de autoencoders VAE continuos: predice directamente tokens de paleta discretos, incluyendo transparencia alfa y sombreado de píxel fino, en 16 a 24 pasos paralelos.

La relevancia del modelo radica en su orientación explícita a edge computing: se distribuye en safetensors, ONNX (Opset 17) y PyTorch FP16, con el objetivo declarado de ejecución sub-milisegundo en CPU y dispositivos de borde. Frente a su predecesor Nyx Image 23M, amplía la profundidad del cuello de botella de 6 a 8 bloques (arquitectura hourglass 2+8+2), introduce un régimen híbrido de optimización Muon + AdamW con planificación Warmup-Stable-Decay (WSD) y añade anclaje perceptual de color en espacio OKLab mediante 512 tokens.

El modelo se entrenó sobre el dataset `Angais/pixel-art-atlas-1.4m` durante 82.342 pasos (30 épocas completas) en una NVIDIA L4 de 24 GB en AWS EC2 Spot, y se publica bajo licencia Apache-2.0. Es un modelo de nicho, sin descargas ni interacciones registradas en el momento de la ficha, lo que refleja su carácter experimental y su enfoque acotado a la generación de sprites retro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión discreta enmascarada (MDLM) con hourglass 2+8+2 y patch merging/unmerging |
| Parametros totales | 26.335.232 (26,34 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (condicionamiento con 24 tokens CLIP + 4 registros prefijo) |
| Tipos de cuantizacion | No disponible (se distribuyen FP16 y ONNX; no se documentan cuantizaciones INT8/INT4) |
| Idiomas soportados | No disponible (condicionamiento textual vía CLIP, idioma no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors, ONNX (Opset 17), PyTorch FP16 |

## Arquitectura y entrenamiento

La arquitectura es un transformer de difusión discreta con estructura hourglass asimétrica. El codificador opera a resolución 16×16 (256 tokens espaciales) con 2 bloques; a continuación un patch merge 2×2 (pixel unshuffle) reduce la rejilla a 8×8, donde 8 bloques de cuello de botella con capas feedforward Conv-SwiGLU (dimensión 384, ratio 3,0) agregan contexto entre píxeles; finalmente un patch unmerge 2×2 (pixel shuffle) con conexión residual devuelve a 16×16, donde 2 bloques de decodificador refinan contornos y bordes alfa. El condicionamiento textual combina 24 tokens CLIP con 4 registros prefijo multimodales aprendidos, integrados en autoatención unificada.

El entrenamiento se realizó sobre `Angais/pixel-art-atlas-1.4m` durante 82.342 pasos (30 épocas), con un régimen híbrido: Muon para pesos 2D y AdamW para vectores y sesgos, con picos de tasa de aprendizaje de 0,015 (Muon) y 3,0×10⁻⁴ (AdamW). La planificación WSD mantuvo la tasa máxima durante el 80 % del entrenamiento (pasos 2.000–65.870) y aplicó un enfriamiento coseno hasta 1,0×10⁻⁵ en los últimos pasos, fase en la que la NLL de validación cayó de 0,9111 a 0,87445. El anclaje de color emplea 512 tokens en espacio OKLab con base de Fourier perceptual, sustituyendo la paleta RGB de 513 colores del modelo anterior. El entrenamiento se ejecutó en una NVIDIA L4 (Ada Lovelace) de 24 GB en AWS EC2 Spot.

## Capacidades

- Generación de imágenes texto-a-imagen restringida a sprites de pixel art de 16×16 píxeles.
- Predicción directa de tokens de paleta discretos, sin VAE continuo, con transparencia alfa integrada.
- Sombreado de píxel fino y transiciones de color perceptuales mediante anclaje OKLab.
- Generación en 16 a 24 pasos paralelos de difusión discreta.
- Condicionamiento textual vía CLIP (24 tokens) con registros prefijo aprendidos.
- Inferencia en CPU y dispositivos de borde gracias a los formatos ONNX y FP16.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo thinking.

## Casos de uso

- Generación de assets para videojuegos retro: el modelo produce sprites de 16×16 con bordes alfa limpios y sin antialiasing, listos para integrarse en motores 2D o pipelines de atlas de texturas sin postprocesado de recorte.
- Prototipado rápido de iconos y personajes: con 16 a 24 pasos de inferencia y un modelo de 26 M de parámetros, permite iterar variaciones de un sprite en entornos de diseño con recursos limitados.
- Despliegue en dispositivos de borde: la exportación a ONNX (Opset 17) y FP16 posibilita ejecutar la generación en CPU o hardware embebido sin GPU dedicada, útil para herramientas de creación en tiempo real dentro de aplicaciones ligeras.
- Generación por lotes de conjuntos de sprites temáticos: el condicionamiento CLIP permite producir familias coherentes de sprites (por ejemplo, variantes de un mismo personaje) a partir de descripciones textuales, adecuado para rellenar catálogos de assets.
- Educación y demostración de difusión discreta: su tamaño reducido y su arquitectura MDLM documentada lo convierten en un caso práctico para estudiar difusión en espacio discreto, planificación WSD y optimizadores híbridos en entornos académicos.
- Integración en pipelines de CI/CD para generación de placeholders: al ser un modelo pequeño con licencia Apache-2.0, puede incorporarse a flujos automatizados que generen sprites provisionales para pruebas de interfaz o maquetas de juego.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados):

| Metrica | Valor | Verificado |
|---|---|---|
| Validation NLL | 0,87445 nats | No |
| Masked Token Accuracy | 77,86 % | No |
| CLIP Alignment Score | 0,2611 | No |
| Parameters | 26.335.232 | No |

Comparación con el predecesor Nyx Image 23M, según la model card:

| Metrica | Nyx Image 23M | Nyx Image 26M |
|---|---|---|
| Validation NLL | 0,9107 | 0,87445 |
| Masked Token Accuracy | 73,6 % | 77,86 % |
| CLIP Alignment Score | ~0,245 | 0,2611 |
| Parametros | 23.191.824 | 26.335.232 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que el modelo no es de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP16 para los 26,34 M de parámetros (el repositorio completo ocupa 0,3 GB); no se documentan requisitos oficiales.
- GPU recomendadas: el autor entrenó en NVIDIA L4 (24 GB); para inferencia es sobredimensionada y basta cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) o incluso CPU.
- Cabe en cualquier GPU consumer: sí, por tamaño (26 M de parámetros) y por la disponibilidad de ONNX para ejecución en CPU.
- Opciones de despliegue: safetensors y PyTorch FP16 para inferencia con PyTorch; ONNX (Opset 17) para ONNX Runtime en CPU y borde. No se documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen).
- Latencia y throughput: el autor afirma ejecución sub-milisegundo en CPU/edge, pero no se publican mediciones reproducibles ni condiciones de prueba.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de generación de pixel art de tamaño y arquitectura similares en la documentación proporcionada. La única comparación disponible es con el predecesor del mismo autor:

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Formatos |
|---|---|---|---|---|---|
| Nyx Image 26M | 26,34 M | MDLM hourglass 2+8+2 | No disponible | Apache-2.0 | Safetensors, ONNX, PyTorch FP16 |
| Nyx Image 23M | 23,19 M | MDLM hourglass 2+6+2 | No disponible | No disponible | Safetensors, ONNX, PyTorch |

## Limitaciones y advertencias

- Modelo de nicho: solo genera sprites de pixel art de 16×16 píxeles; no es un modelo de imagen general ni de lenguaje.
- Sin descargas ni interacciones registradas en Hugging Face en el momento de la ficha, lo que limita la evidencia externa sobre su calidad real.
- Los benchmarks del model-index están marcados como no verificados y proceden únicamente del autor; no hay evaluaciones independientes.
- El CLIP Alignment Score de 0,2611 es bajo en términos absolutos, lo que sugiere una adherencia limitada a prompts complejos.
- No se especifican los idiomas soportados en el condicionamiento textual; el comportamiento multilingüe es desconocido.
- No se documentan sesgos conocidos, pero el dataset de entrenamiento (`Angais/pixel-art-atlas-1.4m`) puede introducir sesgos estilísticos y temáticos propios de su composición.
- Riesgo de alucinación visual: como modelo generativo, puede producir sprites incoherentes o con artefactos, especialmente con prompts fuera de distribución.
- Licencia Apache-2.0 permite uso comercial, pero al no haber verificación independiente conviene validar la calidad en el dominio de aplicación antes de producción.
- No se documentan cuantizaciones ni optimizaciones de despliegue más allá de ONNX y FP16.

## Enlaces

- Hugging Face: https://huggingface.co/Bhoidy/nyx-image-26m
- Sitio del desarrollador: https://sednium.com
- Dataset de entrenamiento: https://huggingface.co/datasets/Angais/pixel-art-atlas-1.4m

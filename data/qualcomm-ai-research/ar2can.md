# Qualcomm-AI-Research/ar2can

## Resumen

Ar2Can es un sistema de generación de imágenes multi-humano desarrollado por Qualcomm AI Research que resuelve el problema de la pérdida o fusión de identidad facial cuando se intenta componer varias personas en una misma escena. El modelo se estructura en dos etapas: un adaptador LoRA denominado "Architect" (sobre FLUX.1-schnell) que planifica la disposición espacial de cada persona, y un segundo adaptador "Artist" (sobre FLUX.1-Kontext-dev) que renderiza la imagen final preservando la identidad facial de las referencias. Esta separación entre planificación y renderizado permite un control explícito de la composición.

El entrenamiento utiliza Flow-GRPO, una adaptación del algoritmo de optimización por política relativa de grupo (GRPO) aplicado a modelos de difusión por flujo, con un sistema de recompensas compuestas que combina alineación espacial húngara, similitud de identidad ArcFace, precisión en el número de personas y calidad perceptual. Una característica destacable es que el modelo se entrena principalmente con datos sintéticos, sin necesidad de imágenes reales multi-humano. Los pesos publicados en este repositorio son adaptadores LoRA de 0.8 GB en total, y se advierte que no son idénticos a los utilizados en el paper, por lo que el rendimiento puede variar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos adaptadores LoRA sobre modelos de difusión FLUX.1 (Architect sobre FLUX.1-schnell, Artist sobre FLUX.1-Kontext-dev) |
| Parametros totales | No disponible (el repositorio contiene dos adaptadores LoRA con r=64 y alpha=128, peso total 0.8 GB) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de texto a imagen) |
| Tipos de cuantizacion | No se menciona cuantización; los pesos se distribuyen en formato safetensors |
| Idiomas soportados | Inglés (prompts) |
| Licencia | other (se debe consultar el repositorio; los adaptadores se derivan de FLUX.1, sujetos a la licencia de Black Forest Labs) |
| Formato de pesos | safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

Ar2Can emplea una arquitectura de dos etapas con adaptadores LoRA independientes. El adaptador Architect, montado sobre FLUX.1-schnell, genera una imagen de prueba o "probe" que define la disposición espacial de las personas (layout). El adaptador Artist, sobre FLUX.1-Kontext-dev, toma ese layout junto con las imágenes de referencia facial y produce la composición final fotorrealista. Ambos adaptadores comparten configuración LoRA: rango 64, alpha 128, dropout 0.0 e inicialización gaussiana. Los módulos objetivo incluyen las proyecciones de atención (q, k, v, out) y las capas feed-forward, tanto del transformer principal como del contexto.

El entrenamiento se realiza mediante Flow-GRPO, una variante de GRPO adaptada a modelos de flujo. La señal de recompensa es compuesta e incluye: (1) alineación espacial húngara entre las caras generadas y las posiciones esperadas, (2) similitud de identidad medida con ArcFace, (3) precisión en el número de personas detectadas y (4) calidad perceptual según HPS. Los datos de entrenamiento son principalmente sintéticos, evitando la necesidad de conjuntos de imágenes reales con múltiples personas.

## Capacidades

- Generación de imágenes fotorrealistas con múltiples personas en una misma escena, preservando la identidad facial de cada individuo de referencia.
- Control explícito de la disposición espacial de las personas mediante la etapa Architect, que genera un layout previo.
- Acepta múltiples imágenes de referencia facial (por ejemplo, tres o cuatro caras) y un prompt de texto en inglés.
- Integración con la librería diffusers y PEFT para facilitar su uso en pipelines personalizados.
- Entrenamiento con refuerzo (RL) que optimiza simultáneamente la precisión del recuento de personas, la fidelidad de identidad y la calidad perceptual.
- Capacidad de funcionar con datos sintéticos en entrenamiento, lo que reduce la dependencia de datos reales etiquetados.
- No incluye soporte para tool calling, agentes ni razonamiento multi-step, al ser un modelo puramente generativo de imágenes.

## Casos de uso

- Fotografía de grupo sintética: crear imágenes de grupo para catálogos, publicidad o redes sociales a partir de retratos individuales de personas, manteniendo su identidad reconocible.
- Previsualización de casting: en producción audiovisual, generar escenas con varios actores antes del rodaje para evaluar la composición y la iluminación.
- Diseño de campañas de marketing: componer escenas con varios modelos sin necesidad de sesiones fotográficas conjuntas, ahorrando costes de producción.
- Generación de avatares para videojuegos o entornos virtuales: crear personajes múltiples a partir de fotografías de usuarios, manteniendo su apariencia.
- Edición de imágenes para medios: insertar personas adicionales en una fotografía existente de forma coherente, por ejemplo en reportajes o ilustraciones.
- Investigación en visión por computador: servir como banco de pruebas para evaluar métodos de preservación de identidad y generación multi-humano, dado que se proporcionan pesos y código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El abstract menciona que el modelo se evalúa en MultiHuman-Testbench y que logra mejoras sustanciales en precisión de recuento y preservación de identidad, pero no se proporcionan métricas numéricas concretas en la model card. Además, se advierte que los pesos liberados no son idénticos a los del paper, por lo que los resultados pueden diferir.

## Requisitos de hardware

- GPU recomendada: 2× NVIDIA A100 de 40 GB (o equivalente, con al menos 70 GB de VRAM total) para ejecutar ambos modelos base (FLUX.1-schnell y FLUX.1-Kontext-dev) junto con los adaptadores.
- CUDA 12.4, Python 3.11 y PyTorch 2.6.0 son los entornos indicados.
- No se menciona si es posible ejecutar en GPUs de consumo (por ejemplo, RTX 4090) debido al alto requisito de memoria para cargar dos modelos de difusión completos.
- Opciones de despliegue: el repositorio oficial incluye un script de inferencia (`infer.py`) y una demo Gradio (`app.py`). También se puede integrar con la librería diffusers y PEFT.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa explícita en la documentación proporcionada. Existen otros métodos de personalización multi-persona como IP-Adapter, PhotoMaker o PuLID, pero no se incluyen datos de rendimiento ni comparaciones en la model card. Por tanto, no se puede realizar una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Los pesos publicados no son idénticos a los reportados en el paper, por lo que el rendimiento puede variar significativamente.
- La licencia es "other" y los adaptadores se derivan de modelos FLUX.1, que tienen su propia licencia restrictiva. Se debe revisar la licencia de Black Forest Labs antes de cualquier uso comercial.
- El modelo está orientado a prompts en inglés; no se garantiza un buen comportamiento con otros idiomas.
- Requiere un hardware muy específico (2× A100 40 GB) y no se ha validado en GPUs de consumo.
- Al ser un modelo generativo, existe riesgo de alucinaciones visuales, como la generación de caras distorsionadas o la mezcla de identidades en escenas complejas.
- El entrenamiento se basa principalmente en datos sintéticos, lo que puede limitar la generalización a escenarios del mundo real con condiciones de iluminación o poses poco comunes.
- No se proporcionan métricas de sesgo o equidad; la diversidad de las identidades generadas puede verse afectada por los datos de entrenamiento.

## Enlaces

- [HuggingFace - Qualcomm-AI-Research/ar2can](https://huggingface.co/Qualcomm-AI-Research/ar2can)
- [arXiv - 2511.22690](https://arxiv.org/abs/2511.22690)
- [Página del proyecto](https://qualcomm-ai-research.github.io/ar2can/)
- [Repositorio GitHub](https://github.com/Qualcomm-AI-research/ar2can)

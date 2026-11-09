# realrebelai/Kandinsky-6.0-Pro-5s_GGUFs

## Resumen

Kandinsky-6.0-Pro-5s_GGUFs es un repositorio de cuantizaciones de bajo consumo de VRAM de los modelos audiovisuales Kandinsky 6.0 Pro 5s y Kandinsky 6.0 Pro Distilled 5s, desarrollados originalmente por el laboratorio kandinskylab y convertidos a formatos W4A8 y GGUF por el usuario realrebelai. El objetivo es hacer accesible la inferencia de un modelo generativo de vídeo con audio en GPUs de consumo, mediante cuantización de pesos a 4 bits y rutas de cómputo optimizadas en 8 bits. No se trata de un modelo nuevo, sino de una distribución de pesos cuantizados pensada para ComfyUI.

El modelo base es un sistema de generación de vídeo a partir de texto o imagen que incorpora también generación de audio, con un codificador de condicionamiento compuesto por Qwen2.5-VL 7B y CLIP-L. La variante Pro estándar emplea 50 pasos de muestreo, mientras que la variante Distilled emplea 10 pasos mediante una ruta de inferencia PiFlow específica. El repositorio ocupa 84,9 GB e incluye tanto pesos W4A8 en safetensors como archivos GGUF con cuantizaciones Q3_K_S y Q4_K_S.

La relevancia actual reside en que permite ejecutar un modelo de vídeo-audio de última generación en entornos con VRAM limitada, algo que con los pesos originales en FP16 resulta inviable para la mayoría de equipos. El autor advierte explícitamente de que las conversiones son experimentales y no han sido probadas de forma exhaustiva en todas las configuraciones de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo y audio; detalles del backbone no especificados) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A8 (pesos 4 bits, cómputo 8 bits), GGUF Q3_K_S, GGUF Q4_K_S |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (W4A8), GGUF (Q3_K_S, Q4_K_S) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de su naturaleza como modelo de difusión para generación conjunta de vídeo y audio. El repositorio documenta la existencia de dos rutas de inferencia: una estándar de 50 pasos para el modelo Pro y otra destilada de 10 pasos basada en PiFlow para el modelo Distilled. Esta última no es una simple reducción de pasos del modelo Pro, sino un checkpoint con su propia ruta de inferencia, según advierte el autor.

El condicionamiento textual se realiza mediante un codificador compuesto por Qwen2.5-VL 7B y CLIP-L. El repositorio incluye una conversión W4A8 del codificador Qwen2.5-VL completo para reducir el consumo de memoria. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación técnica destacable es la doble vía de cuantización: W4A8, que evita la desquantización repetida de tensores empaquetados durante las operaciones lineales y resulta sustancialmente más rápido en hardware compatible, y GGUF, que ofrece niveles de cuantización seleccionables a costa de mayor error de cuantización.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y a partir de imagen (image-to-video).
- Generación de audio asociada al vídeo, según los tags del repositorio (audio-generation).
- Modelo Pro estándar con 50 pasos de muestreo para máxima calidad.
- Modelo Pro Distilled con 10 pasos de muestreo mediante ruta PiFlow, orientado a inferencia rápida.
- Condicionamiento textual mediante Qwen2.5-VL 7B y CLIP-L, lo que permite prompts descriptivos complejos.
- Integración con ComfyUI mediante nodos específicos (sampler Kandinsky, condicionamiento texto/imagen, decodificación de vídeo y audio, manejo de VAE y embellecimiento de prompts).
- Soporte de cuantización W4A8 nativa en ComfyUI sin necesidad de ComfyUI-GGUF.
- Soporte de cuantización GGUF mediante forks de compatibilidad del autor.
- No se documentan en la información disponible capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo explícito.

## Casos de uso

- Generación de vídeo publicitario a partir de una imagen de producto: se introduce una fotografía como condicionamiento y un prompt descriptivo, y el modelo genera un clip de 5 segundos con movimiento y audio, adecuado para prototipos rápidos de campañas.
- Creación de contenido para redes sociales en equipos de consumo: la cuantización Q3_K_S o Q4_K_S permite ejecutar el modelo en GPUs con VRAM limitada, facilitando la producción de clips cortos sin acceso a clústeres.
- Previsualización de storyboards animados: partiendo de bocetos o fotogramas clave, el modelo image-to-video genera animáticas de 5 segundos que ayudan a validar ritmo y composición antes de la producción final.
- Iteración rápida con el modelo Distilled: la variante de 10 pasos PiFlow permite generar múltiples variaciones de un clip en menos tiempo, útil en fases de exploración creativa donde prima la cantidad sobre el acabado final.
- Generación de audio sincronizado para vídeo corto: la capacidad de audio-generation integrada permite obtener clips con pista sonora asociada sin herramientas externas, simplificando el flujo en ComfyUI.
- Integración en pipelines de ComfyUI para automatización: los nodos oficiales y los forks GGUF permiten encadenar el modelo con otros nodos de posprocesado, escalado o composición, construyendo flujos reproducibles para producción de contenido a escala moderada.
- Investigación sobre cuantización de modelos generativos de vídeo: el repositorio ofrece puntos de comparación directos entre W4A8 y GGUF Q3/Q4 sobre el mismo modelo base, útil para estudiar el impacto de la cuantización en calidad y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma numérica en la información proporcionada. El repositorio está etiquetado como low-vram y ofrece cuantizaciones Q3_K_S y Q4_K_S precisamente para reducir requisitos de memoria, pero no se especifican cifras exactas.
- GPU recomendadas: no disponible. El autor no indica modelos concretos de GPU probados.
- Compatibilidad con GPU de consumo: el objetivo declarado del repositorio es facilitar la ejecución en entornos de VRAM reducida, aunque no se confirma qué GPUs concretas lo ejecutan correctamente.
- Opciones de despliegue: ComfyUI es el único entorno documentado. Para W4A8 se requieren los nodos oficiales de Kandinsky 6 (https://github.com/kandinskylab/kandinsky-6). Para GGUF se requieren dos forks: Kandinsky6_GGUF y ComfyUI-GGUF-Rebel, ambos del autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un modelo de difusión de vídeo.
- Latencia y throughput: no disponibles. El autor señala que W4A8 puede ser sustancialmente más rápido que GGUF en hardware compatible con kernels W4A8 nativos, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kandinsky-6.0-Pro-5s_GGUFs (este repo) | no disponible | no disponible | W4A8, GGUF Q3_K_S, Q4_K_S | MIT | Hugging Face, ComfyUI |
| Kandinsky 6.0 Pro 5s (original, kandinskylab) | no disponible | no disponible | safetensors (FP16 presumiblemente) | MIT (según modelo base) | Hugging Face |
| Kandinsky 6.0 Pro Distilled 5s (original) | no disponible | no disponible | safetensors | MIT (según modelo base) | Hugging Face |

No se dispone de información sobre otros modelos comparables de generación de vídeo con audio en la documentación proporcionada. Los datos de rendimiento comparativo entre las variantes originales y las cuantizadas no están publicados.

## Limitaciones y advertencias

- Estado experimental: el autor indica explícitamente que las conversiones son recientes y no han sido probadas de forma exhaustiva en todas las configuraciones de hardware y flujos de trabajo.
- Error de cuantización: las variantes Q3_K_S y Q4_K_S introducen error adicional respecto a los pesos originales; el autor recomienda Q4_K_S como equilibrio calidad/tamaño y menciona que existen INT8 en otros repositorios para quienes dispongan de más cómputo.
- Dependencia de forks: el uso de GGUF requiere dos forks de compatibilidad del autor (Kandinsky6_GGUF y ComfyUI-GGUF-Rebel) en lugar de los nodos oficiales, lo que añade riesgo de mantenimiento y de incompatibilidades futuras con ComfyUI.
- Conflicto de nodos: no deben instalarse simultáneamente el paquete oficial Kandinsky6 y Kandinsky6_GGUF, según advierte el autor.
- Modelo Distilled con ruta propia: el checkpoint destilado no funciona simplemente reduciendo pasos del modelo Pro; debe ejecutarse con su ruta PiFlow y ajustes específicos, lo que puede provocar resultados incorrectos si se configura mal.
- Idiomas: no se documenta qué idiomas soporta el condicionamiento textual; el codificador Qwen2.5-VL 7B sugiere capacidad multilingüe, pero no se confirma para la generación.
- Sesgos y alucinación: no se documentan sesgos conocidos ni tasas de alucinación en la información disponible; como modelo generativo de vídeo, existe riesgo de artefactos visuales y de contenido incoherente con el prompt.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base original de kandinskylab, ya que la ficha solo confirma la licencia del repositorio de cuantizaciones.
- Sin benchmarks: no hay datos publicados que permitan evaluar la pérdida de calidad de las cuantizaciones frente al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/realrebelai/Kandinsky-6.0-Pro-5s_GGUFs
- Modelo base (Pro 5s): https://huggingface.co/kandinskylab/Kandinsky-6.0-Pro-5s-Diffusers
- Modelo base (Distilled 5s): https://huggingface.co/kandinskylab/Kandinsky-6.0-Pro-distill-5s-Diffusers
- Nodos oficiales Kandinsky 6 para ComfyUI: https://github.com/kandinskylab/kandinsky-6
- Fork Kandinsky6_GGUF: https://github.com/RealRebelAI/Kandinsky6_GGUF
- Fork ComfyUI-GGUF-Rebel: https://github.com/RealRebelAI/ComfyUI-GGUF-Rebel
- ComfyUI-GGUF original (city96): https://github.com/city96/ComfyUI-GGUF

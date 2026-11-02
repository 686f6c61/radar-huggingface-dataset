# fghui/WANCum

## Resumen

WANCum es un adaptador LoRA para generación de imágenes (y, por su modelo base, potencialmente vídeo a partir de imagen) publicado por el usuario fghui en HuggingFace. Se distribuye como un repositorio de 1,2 GB en formato diffusers, con la etiqueta `template:diffusion-lora`, y está entrenado sobre el checkpoint `TestOrganizationPleaseIgnore/WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING`, un merge de la familia Wan 2.2 orientado a efectos visuales y a la conversión imagen-a-vídeo. El pipeline declarado en los metadatos es `text-to-image`.

El propósito declarado del adaptador es la generación de contenido sexual explícito, con una palabra de activación (`instance_prompt`) de carácter explícito y un widget de ejemplo que describe una escena pornográfica. No se trata, por tanto, de un modelo de propósito general, sino de un LoRA de especialización temática sobre un modelo base de difusión.

La información pública disponible es mínima: no hay licencia declarada, no se especifican idiomas, no hay datos de entrenamiento, número de pasos, resolución, learning rate ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y las fechas de creación y actualización (2 de noviembre de 2026) distan apenas 24 segundos, lo que sugiere una subida automatizada o de prueba.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusión de la familia Wan 2.2 (merge de efectos visuales, I2V lightning) |
| Parámetros totales | no disponible (el repo ocupa 1,2 GB; el número de parámetros del adaptador no se declara) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica a difusión; la ventana relevante sería la longitud máxima del prompt de texto, no declarada) |
| Tipos de cuantización | no disponible (formato de pesos del LoRA en diffusers; el modelo base admitiría fp16/bf16, pero no se documenta) |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | no disponible |
| Formato de pesos | diffusers (repositorio de 1,2 GB; safetensors presumiblemente, no confirmado en la información disponible) |

## Arquitectura y entrenamiento

El artefacto es un LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas de atención (y presumiblemente en las proyecciones de las capas cruzadas de texto) de un modelo de difusión base. El modelo base declarado, `TestOrganizationPleaseIgnore/WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING`, pertenece a la familia Wan 2.2 en su variante imagen-a-vídeo con destilación tipo "lightning" (pocos pasos de inferencia) y fusionada con efectos visuales. El pipeline etiquetado es `text-to-image`, aunque el base es I2V, lo que introduce ambigüedad sobre el modo de uso real.

No se ha publicado ninguna información sobre el dataset de entrenamiento: ni número de imágenes, ni resolución, ni composición, ni si hubo regularización o captions automáticos. Tampoco se documenta el número de pasos, el optimizer, el rango del LoRA ni el learning rate. No hay evidencia de RLHF, DPO ni ningún otro ajuste por preferencias; en difusión estos mecanismos no aplican del modo habitual. La única innovación técnica identificable es la herencia del modelo base: un merge de efectos visuales con destilación lightning, que reduce el número de pasos de muestreo necesarios.

## Capacidades

- Generación de imágenes condicionada por texto mediante un adaptador LoRA sobre un modelo de difusión.
- Especialización en contenido sexual explícito, activada por la frase `cum pulses out of the penis and onto her face and tongue and mouth`.
- Posible generación de vídeo a partir de imagen, heredada del modelo base I2V, aunque el pipeline declarado es text-to-image y no se documenta el flujo de uso.
- No se documenta soporte de tool calling, function calling ni agentes (no aplica a modelos de difusión).
- No se documenta capacidad multilingüe; los ejemplos están en inglés.
- No se documenta modo "thinking", visión, audio ni ninguna capacidad adicional más allá de la generación visual.

## Casos de uso

- Investigación sobre alineación y filtrado de contenido: el adaptador sirve como muestra de cómo un LoRA puede especializar un modelo base hacia contenido explícito, útil para estudiar la eficacia de los filtros de seguridad en pipelines de difusión.
- Auditoría de modelos en plataformas de moderación: permite comprobar si los clasificadores de contenido detectan adaptadores de bajo rango entrenados para eludir salvaguardas del modelo base.
- Estudio de transferencia de estilo sobre merges de la familia Wan: al estar montado sobre un merge de efectos visuales, permite analizar cómo un LoRA temático interactúa con un base ya fusionado.
- Pruebas de reproducibilidad de LoRA: con 1,2 GB de pesos y una única palabra de activación, es un caso pequeño para validar pipelines de carga de adaptadores en diffusers.
- Docencia sobre riesgos de modelos abiertos: ejemplifica la facilidad de publicar adaptadores de contenido sensible sin licencia ni documentación.
- No se recomienda su uso en producción comercial ni en aplicaciones orientadas al usuario final, dada la ausencia de licencia y la naturaleza del contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica. El adaptador pesa 1,2 GB; el modelo base Wan 2.2 I2V es un modelo de difusión de vídeo de gran tamaño, por lo que la VRAM vendrá determinada por el base, no por el LoRA.
- GPU recomendadas: no disponible. Para modelos de difusión de vídeo de la familia Wan se suele requerir GPU de datacenter (A100, H100) o consumer de gama alta con suficiente VRAM; no se confirma en la información proporcionada.
- ¿Cabe en consumer GPU?: no disponible. Depende del modelo base y de la cuantización empleada, que no se documenta.
- Opciones de despliegue: al estar en formato diffusers, es cargable con la librería `diffusers` de HuggingFace; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusión).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WANCum (fghui) | LoRA de difusión | WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros LoRA comparables en la misma categoría temática ni sobre sus métricas, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Contenido sexual explícito: el adaptador está entrenado para generar pornografía, lo que puede violar las políticas de uso de plataformas de despliegue y las legislaciones locales sobre contenido.
- Ausencia de licencia: no se declara licencia alguna, por lo que no hay permiso explícito para uso comercial ni para redistribución; en la práctica, el uso queda en un limbo legal.
- Sin documentación de entrenamiento: no hay datos sobre dataset, pasos, rango ni hiperparámetros, lo que impide reproducir o auditar el adaptador.
- Ambigüedad de pipeline: se declara `text-to-image` pero el base es I2V; el flujo de uso real no está claro.
- Riesgo de alucinación y artefactos: como todo LoRA de difusión sin evaluación publicada, no hay garantía sobre la calidad anatómica o la coherencia de las imágenes generadas.
- Sesgos: no documentados, pero un adaptador entrenado sobre un único prompt explícito tiende a sobreajustarse a esa escena concreta y a reproducir sesgos de género y corporales del dataset no declarado.
- Idiomas: solo se documentan prompts en inglés; el comportamiento con otros idiomas es desconocido.
- Repositorio sin tracción: 0 descargas y 0 likes, con fechas de creación y actualización separadas por 24 segundos, lo que sugiere un artefacto de prueba más que un modelo mantenido.
- Riesgo de seguridad: la publicación de adaptadores de contenido explícito sin salvaguardas facilita su uso para generar material no consentido; conviene tratarlo con las precauciones legales y éticas correspondientes.

## Enlaces

- HuggingFace: https://huggingface.co/fghui/WANCum
- Modelo base: https://huggingface.co/TestOrganizationPleaseIgnore/WAMU-Merge-VisualEffects_WAN2.2_I2V_LIGHTNING
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

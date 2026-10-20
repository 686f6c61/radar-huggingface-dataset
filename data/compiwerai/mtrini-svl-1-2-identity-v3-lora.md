# CompiwerAI/Mtrini-SVL-1.2-Identity-v3-LoRA

## Resumen

Mtrini-SVL-1.2-Identity-v3-LoRA es un adaptador LoRA (PEFT) publicado por CompiwerAI sobre el modelo base multimodal Qwen/Qwen3-VL-8B-Instruct. No se trata de un modelo autónomo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors (0,2 GB), que deben cargarse junto al modelo base mediante PEFT y Transformers. Su propósito declarado es experimental: ajustar el comportamiento de autoidentificación del modelo base dentro del proyecto Mtrini-SVL-1.2, con etiquetado específico para dariya marroquí (moroccan-darija).

El modelo hereda del base su naturaleza multimodal (visión-lenguaje) y su tamaño de 8.000 millones de parámetros, aunque el adaptador en sí solo añade un conjunto reducido de matrices de bajo rango. La model card es explícita al respecto: las evaluaciones de identidad muestran que la autoidentificación «aún no es fiable», por lo que el autor advierte de que no debe presentarse como una solución al problema de consistencia de identidad. Es, por tanto, un artefacto de investigación en fase temprana, con cero descargas y cero «likes» en el momento de la consulta.

Su relevancia actual es limitada y muy acotada: sirve como ejemplo de adaptación ligera sobre un VLM de 8B para una identidad y una lengua concretas, y como caso práctico de los riesgos de publicar adaptadores sin evaluación reproducibles. No hay pipeline declarado, ni idiomas formalmente listados, ni resultados de benchmarks en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal visión-lenguaje (modelo base Qwen/Qwen3-VL-8B-Instruct) |
| Parámetros totales | No disponible para el adaptador (el modelo base declara 8B en su denominación); repositorio de 0,2 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada (depende del modelo base) |
| Tipos de cuantización | No disponible para el adaptador; al ser safetensors PEFT, la cuantización aplicable sería la del modelo base al cargarlo |
| Idiomas soportados | No disponibles formalmente; la etiqueta del repositorio menciona «moroccan-darija» |
| Licencia | Apache 2.0 (adaptador); el modelo base mantiene su propia licencia y términos |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en determinadas capas del transformer del modelo base y que se entrenan dejando congelados los pesos originales. El repositorio se declara con `library_name: peft` y etiquetas `adapter`, `lora` y `peft`, y su tamaño (0,2 GB) es coherente con un adaptador de rango bajo sobre un modelo de 8B, no con un modelo completo. El modelo base es Qwen3-VL-8B-Instruct, un transformer multimodal de la familia Qwen3-VL en su variante instruida.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas propias: el valor diferencial declarado es el ajuste de identidad y la cobertura de dariya marroquí. La model card incluye una advertencia explícita de que la consistencia de autoidentificación no está resuelta, lo que sugiere un proceso de evaluación interno insuficiente o no publicado.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3-VL-8B-Instruct (no verificados de forma independiente para este adaptador).
- Procesamiento de imágenes y texto (visión-lenguaje), al estar construido sobre un VLM.
- Ajuste específico orientado a la autoidentificación del modelo dentro del proyecto Mtrini-SVL-1.2, con resultados declarados como no fiables.
- Cobertura declarada (por etiqueta) de dariya marroquí; sin datos sobre calidad o alcance real.
- Soporte de tool calling, function calling y comportamiento agéntico: no disponible en la información proporcionada para el adaptador (dependería del base).
- Modo «thinking» o razonamiento extendido: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Investigación sobre adaptación de identidad en VLMs: el adaptador permite reproducir y auditar el efecto de un LoRA de identidad sobre Qwen3-VL-8B, comparando respuestas con y sin adaptador en la misma semilla y prompt.
- Experimentación con dariya marroquí en entornos controlados: útil para prototipar respuestas en esa variedad lingüística, siempre con revisión humana y sin asumir calidad de producción.
- Evaluación de riesgos de publicación de adaptadores: sirve como caso de estudio de una model card que admite limitaciones (autoidentificación no fiable) y de la necesidad de benchmarks reproducibles.
- Base para técnicas de composición de adaptadores: al ser un LoRA pequeño, se puede combinar con otros adaptadores (por ejemplo, de estilo o de dominio) para estudiar interferencias entre ellos mediante PEFT.
- Docencia y formación técnica: ejemplo mínimo de cómo se estructura un repositorio PEFT (configuración, safetensors, base_model) y de cómo se carga con Transformers.
- Pruebas de pipeline multimodal en local: al requerir solo el base de 8B más 0,2 GB de adaptador, permite montar un entorno de inferencia imagen-texto en una sola GPU consumer para experimentación, no para servicio público.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible para el adaptador de forma aislada; el consumo vendrá determinado por el modelo base Qwen3-VL-8B-Instruct. Como referencia de orden de magnitud, un modelo de 8B en precisión completa requiere del orden de decenas de GB, y en cuantizaciones de 4-8 bits se reduce sustancialmente, aunque no se dispone de cifras verificadas en la información proporcionada.
- GPU recomendadas: no disponibles en la información proporcionada. La viabilidad en GPU consumer depende del base y de la cuantización elegida.
- Compatibilidad con GPU consumer: no confirmada; el adaptador en sí (0,2 GB) es trivial, el cuello de botella es el modelo base.
- Opciones de despliegue: carga mediante PEFT + Transformers. Otros entornos (vLLM, llama.cpp, Ollama, TGI) no están documentados para este adaptador; la fusión previa del LoRA en el base sería el camino habitual para servir con motores optimizados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mtrini-SVL-1.2-Identity-v3-LoRA | Adaptador LoRA sobre VLM | Adaptador (base 8B) | No disponible | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-VL-8B-Instruct | Modelo completo VLM | 8B (según denominación) | No disponible en la información | No disponible en la información | HuggingFace |
| Otros adaptadores LoRA de identidad/estilo sobre Qwen | Adaptador LoRA | Variable | Heredado del base | Variable | No disponible |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada, por lo que la comparación se limita a tipo de artefacto, licencia y disponibilidad.

## Limitaciones y advertencias

- La propia model card advierte de que la autoidentificación «no es fiable»; el adaptador es experimental y no resuelve la consistencia de identidad.
- No es un modelo autónomo: requiere el modelo base Qwen/Qwen3-VL-8B-Instruct y una versión compatible de PEFT/Transformers.
- Ausencia total de evaluación publicada: cero benchmarks, cero métricas de identidad, cero datos de dataset o de proceso de entrenamiento.
- Idiomas no declarados formalmente; la cobertura de dariya marroquí es una etiqueta sin evidencia de calidad.
- Riesgo de alucinación inherente al modelo base, no mitigado ni cuantificado por el adaptador.
- Sesgos potenciales heredados del base y del dataset de ajuste, no documentados.
- Licencia Apache 2.0 para el adaptador, pero la redistribución o el uso comercial del conjunto exige revisar la licencia y los términos del modelo base.
- Sin pipeline declarado, sin descargas y sin «likes»: no hay señal de validación por parte de la comunidad.
- No apto para producción sin una evaluación propia previa, incluida la verificación de que el adaptador no degrada capacidades del base.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; no se han podido localizar papers, blogs ni demos asociados.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/CompiwerAI/Mtrini-SVL-1.2-Identity-v3-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
- Paper, blog, repositorio o demo adicionales: no disponible (la búsqueda web no arrojó resultados pertinentes)

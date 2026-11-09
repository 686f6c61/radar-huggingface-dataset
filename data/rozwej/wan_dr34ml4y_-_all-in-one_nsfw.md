# Rozwej/WAN_DR34ML4Y_-_All-In-One_NSFW

## Resumen

WAN DR34ML4Y - All-In-One NSFW es una recopilación de pesos (checkpoints y LoRAs) para el modelo de generación de vídeo WAN, publicada por el creador c0ur4ge y redistribuida en Hugging Face por el usuario Rozwej. No se trata de un modelo de lenguaje ni de un transformer de texto: el repositorio agrupa varias versiones de pesos orientadas a generación de vídeo texto-a-vídeo (T2V) e imagen-a-vídeo (I2V), con especialización en contenido para adultos (NSFW). El repositorio tiene un tamaño de 0,3 GB, lo que sugiere que contiene componentes parciales (LoRAs, adaptadores o pesos de preview) más que los checkpoints completos del modelo base.

La relevancia de esta ficha es limitada desde el punto de vista de la evaluación técnica de modelos de IA: no hay model card técnica, no se declaran parámetros, arquitectura, contexto ni licencia, y el pipeline no está definido en Hugging Face. La información disponible se reduce a la tabla de versiones incluidas y a los enlaces a Civitai. Cualquier dato sobre arquitectura, entrenamiento o rendimiento debe considerarse no disponible.

Se advierte de que el contenido del modelo es explícitamente NSFW y que el repositorio está marcado como `not-for-all-audiences`. Esta ficha se limita a documentar lo que el autor declara; no se han verificado los pesos ni su funcionamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia WAN de generación de vídeo, según el nombre) |
| Parametros totales | no disponible (las versiones mencionan 5B y 14B en el nombre, sin confirmación técnica) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene carpetas por versión; no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

No hay información técnica publicada en el repositorio sobre la arquitectura del modelo base ni sobre el proceso de entrenamiento. Los nombres de las carpetas (`T2V_PREVIEW_WAN_21`, `TI2B_5B_V1`, `v1.0_I2V_14B_HIGH`, `v1.0_I2V_14B_LOW`) indican variantes de generación texto-a-vídeo e imagen-a-vídeo, y sugieren tamaños de 5B y 14B parámetros, pero no se aporta ninguna confirmación, ni detalles sobre dataset, número de tokens, RLHF/DPO ni innovaciones técnicas.

El repositorio parece ser una agregación de artefactos (posiblemente LoRAs o checkpoints parciales) más que un modelo entrenado de forma independiente por el autor del repo. No se dispone de información sobre el modelo base WAN ni sobre la procedencia de los pesos.

## Capacidades

- Generación de vídeo a partir de texto (T2V), según la versión `T2V_PREVIEW_WAN_21`.
- Generación de vídeo a partir de imagen (I2V), según las versiones `v1.0_I2V_14B_HIGH` y `v1.0_I2V_14B_LOW`.
- Variante etiquetada como `TI2B_5B_V1`, cuya función exacta (posiblemente texto-imagen-a-vídeo o similar) no está documentada.
- Especialización en contenido NSFW, según el título y la etiqueta `not-for-all-audiences`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo.

## Casos de uso

- Generación de vídeo corto a partir de prompts de texto: la versión T2V permitiría crear clips a partir de descripciones textuales, aunque no se especifican resolución, duración ni framerate.
- Animación de imágenes fijas: las versiones I2V permiten convertir una imagen de entrada en un vídeo, útil para prototipos de animación o storyboards.
- Experimentación artística con contenido para adultos: el modelo está orientado explícitamente a este nicho, por lo que su uso principal sería la generación de material NSFW en entornos controlados y con las salvaguardas legales correspondientes.
- Pruebas de pipelines de difusión para vídeo: investigadores podrían usar los pesos para comparar variantes HIGH/LOW de una misma familia.
- Evaluación de adaptadores/LoRAs sobre el modelo base WAN: el repo parece contener artefactos parciales que podrían integrarse en flujos de trabajo con el modelo base.
- Docencia o análisis de sesgos en modelos generativos: el contenido NSFW permite estudiar comportamientos y sesgos en modelos de difusión de vídeo, siempre con las precauciones éticas y legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Si las variantes de 14B corresponden a parámetros reales, la inferencia en precisión completa requeriría del orden de 28 GB o más, pero no hay datos confirmados.
- GPU recomendadas: no disponible. Por tamaño de repo (0,3 GB) es probable que los pesos completos no estén incluidos, por lo que no se puede estimar.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta ComfyUI, Diffusers, vLLM ni llama.cpp).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información suficiente sobre el modelo base WAN ni sobre alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Contenido explícitamente NSFW: el repositorio está marcado como `not-for-all-audiences` y su uso puede estar restringido por las políticas de las plataformas y por la legislación aplicable.
- Licencia no declarada: no se puede determinar si el uso comercial está permitido; se debe contactar con el autor original en Civitai antes de cualquier uso en producción.
- Ausencia de documentación técnica: no hay información sobre arquitectura, entrenamiento, parámetros reales ni formato de pesos, lo que impide una evaluación rigurosa.
- Riesgo de contenido no verificado: al ser una redistribución de pesos de terceros, no hay garantía sobre la integridad, procedencia ni posibles modificaciones maliciosas.
- Tamaño del repo (0,3 GB) incompatible con checkpoints completos de 14B: es probable que falten componentes o que los pesos sean parciales, lo que puede impedir su uso directo.
- Sin datos sobre sesgos, alucinación o limitaciones idiomáticas.
- Posibles restricciones legales en función de la jurisdicción para contenido para adultos generado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Rozwej/WAN_DR34ML4Y_-_All-In-One_NSFW
- Página del modelo en Civitai: https://civitai.com/models/1811313
- Perfil del creador en Civitai: https://civitai.com/user/c0ur4ge
- Versión T2V_PREVIEW_WAN_21: https://civitai.com/models/1811313?modelVersionId=2049787
- Versión TI2B_5B_V1: https://civitai.com/models/1811313?modelVersionId=2099309
- Versión v1.0_I2V_14B_HIGH: https://civitai.com/models/1811313?modelVersionId=2176505
- Versión v1.0_I2V_14B_LOW: https://civitai.com/models/1811313?modelVersionId=2190476

# pmczip/Krea2Raw_Loras

## Resumen

Krea2Raw_Loras es una colección de adaptadores LoRA (Low-Rank Adaptation) para el modelo de difusión texto-a-imagen Krea-2-Raw, desarrollado por el usuario pmczip y publicado en Hugging Face. Su función principal es inyectar en el modelo base la capacidad de generar representaciones fotorrealistas de rostros de personas concretas (celebridades y figuras públicas), empleando tokens de activación ofuscados (cadenas alfanuméricas como "4j133" o "4nn41i5b4550") que actúan como disparadores de cada identidad aprendida.

El repositorio, de aproximadamente 19,1 GB, agrupa múltiples LoRAs empaquetados en formato safetensors compatibles con la librería diffusers. Cada adaptador se entrena sobre el checkpoint krea/Krea-2-Raw y se distribuye bajo una licencia personalizada (bespoke-lora-trained-license) vinculada a Civitai, lo que condiciona su uso comercial. El modelo está etiquetado únicamente para inglés y su pipeline es text-to-image.

La relevancia de este tipo de publicación es doble: por un lado, demuestra el ecosistema de personalización de modelos de difusión de última generación mediante LoRAs de bajo rango; por otro, plantea cuestiones éticas y legales relevantes sobre el uso de la semejanza (likeness) de personas reales en generación de imágenes sintéticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelo de difusión texto-a-imagen Krea-2-Raw |
| Parametros totales | no disponible (depende del rango y numero de adaptadores; el repo ocupa 19,1 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | bespoke-lora-trained-license (other) |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El artefacto es un conjunto de LoRAs, es decir, matrices de bajo rango que se inyectan en las capas de atención y proyección del modelo base de difusión Krea-2-Raw. No se trata de un modelo completo, sino de adaptadores que modifican el comportamiento del modelo base sin reentrenarlo por completo, lo que reduce drásticamente el coste de personalización. Cada LoRA se asocia a un token de activación ofuscado que el modelo aprende a vincular con una identidad facial concreta.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el rango de las matrices LoRA ni si se emplearon técnicas de regularización o RLHF. La model card únicamente documenta ejemplos de uso mediante prompts en inglés con tokens de activación y describe el estilo fotográfico buscado (retratos de alta resolución, iluminación suave, fondos sólidos). El tamaño del repositorio (19,1 GB) sugiere que contiene varios adaptadores o versiones empaquetadas junto con imágenes de ejemplo.

## Capacidades

- Generación de imágenes fotorrealistas de retratos de personas concretas mediante tokens de activación ofuscados.
- Personalización de identidad (likeness) sobre el modelo base Krea-2-Raw.
- Control de atributos visuales mediante prompts en lenguaje natural: peinado, color de ojos, vestimenta, fondo, iluminación y encuadre.
- Compatibilidad con el ecosistema diffusers para carga y combinación de LoRAs.
- Etiquetado para uso con variantes Krea2-turbo y Krea2-raw.
- Soporte exclusivo de prompts en inglés.
- No dispone de tool calling, razonamiento multi-paso ni capacidades de agente (es un modelo de imagen).

## Casos de uso

- Prototipado de personajes para narrativa visual: el LoRA permite mantener una identidad facial coherente entre ilustraciones de un mismo personaje en distintos encuadres y escenarios, útil en preproducción de cómics o storyboards.
- Pruebas de concepto en publicidad: generación rápida de variaciones de retrato con atributos controlados (iluminación, vestuario, fondo) para validar direcciones creativas antes de una sesión fotográfica real.
- Investigación sobre sesgos en modelos de difusión: el conjunto de LoRAs sirve como caso de estudio para analizar cómo se representan identidades concretas y qué sesgos de género, etnia o edad aparecen en los resultados.
- Docencia en generación de imágenes: ejemplo práctico de cómo funciona un LoRA de identidad y de las implicaciones éticas de la personalización facial.
- Evaluación de pipelines de difusión: banco de pruebas para medir la fidelidad de identidad, la calidad fotográfica y la estabilidad de los tokens de activación en distintas configuraciones de muestreo.
- Auditoría de licencias y cumplimiento: caso real para estudiar las restricciones de la licencia bespoke-lora-trained-license y su aplicabilidad en entornos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; depende del modelo base Krea-2-Raw y de la precisión de carga. El repositorio ocupa 19,1 GB en disco, lo que orienta sobre el espacio necesario, pero no sobre la VRAM en ejecución.
- GPU recomendadas: no disponible en la información proporcionada; para modelos de difusión de gran tamaño se suelen emplear A100, H100 o RTX 4090, pero no hay datos confirmados para este caso.
- Compatibilidad con GPU de consumo: no confirmada; requiere verificar los requisitos del modelo base Krea-2-Raw.
- Opciones de despliegue: diffusers (librería declarada); otras opciones como ComfyUI, Automatic1111 o TGI no están documentadas en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Krea2Raw_Loras (pmczip) | LoRA sobre Krea-2-Raw | no disponible | no aplica | bespoke-lora-trained-license | Hugging Face |
| LoRAs de identidad sobre Stable Diffusion (p. ej. Civitai) | LoRA sobre SD/SDXL | no disponible | no aplica | variable según autor | Civitai / Hugging Face |
| LoRAs de estilo sobre Flux | LoRA sobre Flux | no disponible | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Uso de semejanza de personas reales: el modelo está diseñado para reproducir rostros de celebridades, lo que puede vulnerar derechos de imagen y normativas de protección de datos.
- Riesgo ético y legal: la generación de imágenes de personas reales en contextos no consentidos puede constituir difamación, suplantación o contenido dañino.
- Licencia restrictiva: la bespoke-lora-trained-license condiciona el uso comercial; es imprescindible revisar sus términos antes de cualquier despliegue en producción.
- Idioma limitado: solo se documentan prompts en inglés, lo que reduce su utilidad en castellano sin traducción previa.
- Sesgos potenciales: al entrenarse sobre identidades concretas, puede amplificar sesgos de género, etnia o edad presentes en los datos.
- Alucinación visual: como todo modelo de difusión, puede generar artefactos anatómicos o inconsistencias en rasgos faciales, especialmente en ángulos poco representados.
- Falta de transparencia técnica: no se documentan el rango de los LoRA, el dataset de entrenamiento ni métricas de fidelidad, lo que dificulta evaluar su robustez.
- Dependencia del modelo base: su comportamiento y calidad están supeditados a Krea-2-Raw y a sus propias limitaciones y licencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/pmczip/Krea2Raw_Loras
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia bespoke-lora-trained-license: https://multimodal.art/civitai-licenses

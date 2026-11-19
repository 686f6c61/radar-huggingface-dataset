# nphSi/Z-Image-Lora

## Resumen

Z-Image-Lora es una colección de adaptadores LoRA para el modelo de difusión texto-a-imagen Tongyi-MAI/Z-Image y su variante acelerada Z-Image-Turbo, publicada por el usuario nphSi en Hugging Face. El repositorio no contiene un modelo generativo completo, sino un conjunto masivo de LoRA de personajes (actores, actrices, celebridades y figuras públicas) que se aplican sobre el modelo base para reproducir rostros y estilos concretos mediante palabras de activación del tipo `vrtlxxxx`.

El propósito del proyecto es ofrecer un índice descargable y previsualizable de LoRA de personajes ("Lookalike-LoRA-Index"), con disparadores normalizados que el autor ha definido a partir de su propio proceso de etiquetado (captioning). Esto resuelve el problema de la reproducibilidad en la generación de retratos fotorrealistas: sin un disparador correcto, el modelo base no asocia el nombre con el rostro, y el autor documenta explícitamente que términos genéricos como "woman" o "1girl" no funcionan con sus captions.

La relevancia actual del repositorio radica en su volumen de descargas (más de 339.000) y en su actualización continuada a lo largo de 2026, lo que lo convierte en uno de los catálogos de LoRA de personajes más consultados del ecosistema Z-Image. La licencia declarada es Apache 2.0, aunque esta se aplica a los adaptadores, no al modelo base, cuyos términos deben verificarse por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptadores de bajo rango) sobre modelo de difusión texto-a-imagen Z-Image |
| Parámetros totales | no disponible (el repo ocupa 126,0 GB y agrupa múltiples LoRA) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible para los LoRA; las previsualizaciones usan Z-Image-Turbo en Q8 |
| Idiomas soportados | no disponible (los prompts de ejemplo están en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

Se trata de adaptadores LoRA (Low-Rank Adaptation) entrenados sobre el modelo de difusión Z-Image de Tongyi-MAI. No se dispone de información sobre el rango, el alpha, el número de pasos de entrenamiento ni el tamaño del dataset utilizado para cada adaptador. El autor indica que su método de etiquetado (captioning) es determinante: cada personaje requiere un disparador `vrtlxxxx` y el nombre real no debe usarse si el conocimiento interno del modelo base está censurado o es confuso. Los LoRA con múltiples disparadores (`vrtlxx`, `vrtlyy`) se combinan mediante el prefijo `vrtlMain`.

Las previsualizaciones del repositorio se generaron con Z-Image-Turbo en cuantización Q8, sampler Euler, scheduler beta, 9 pasos, CFG 1 y AuraFlow 6, lo que aporta una referencia concreta de configuración de inferencia para reproducir resultados.

## Capacidades

- Generación de retratos fotorrealistas de personajes concretos mediante LoRA de identidad.
- Control fino de composición y encuadre (primer plano, plano medio, cuerpo entero) mediante prompts descriptivos.
- Reproducción de rasgos faciales consistentes entre generaciones al usar el mismo disparador.
- Combinación de varios disparadores para mezclar identidades o estilos.
- Integración con el pipeline `text-to-image` de diffusers.
- Compatibilidad con Z-Image y Z-Image-Turbo (variante acelerada de pocos pasos).
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo de imagen.

## Casos de uso

- **Previsualización de catálogo de LoRA**: el índice enlazado permite descargar, previsualizar y consultar la ficha de cada adaptador antes de integrarlo, lo que agiliza la selección en flujos de trabajo de generación de retratos.
- **Generación de retratos para pruebas de concepto**: usar un disparador `vrtlxxxx` con un prompt de encuadre controlado permite obtener variaciones consistentes de un mismo rostro para maquetas y prototipos visuales.
- **Investigación sobre sesgos en modelos de difusión**: el repositorio reúne cientos de identidades etiquetadas de forma homogénea, lo que facilita estudios comparativos sobre representación y sesgo demográfico.
- **Evaluación de técnicas de captioning**: al documentar el autor su método de etiquetado y sus límites ("woman" no funciona), sirve como caso de estudio reproducible sobre cómo los captions afectan a la composición y la pose.
- **Pipelines de ilustración asistida**: integrado en diffusers, el LoRA puede cargarse junto al modelo base para generar retratos de referencia que un ilustrador refine después.
- **Docencia y divulgación**: los ejemplos de prompt y los ajustes de inferencia publicados (Euler, beta, 9 pasos, CFG 1) sirven como material didáctico sobre parametrización de modelos de difusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El repositorio completo ocupa 126,0 GB, por lo que el almacenamiento necesario para clonarlo es elevado; conviene descargar solo los adaptadores concretos.
- Cada LoRA individual es de tamaño reducido (típicamente decenas o cientos de MB), pero no se dispone del desglose por fichero.
- El modelo base Z-Image no se distribuye en este repositorio; su VRAM depende de la cuantización elegida (las previsualizaciones usan Q8).
- No se dispone de datos de VRAM, GPU recomendadas, latencia ni throughput para este repositorio.
- Despliegue mediante la librería `diffusers`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusión de imagen en este contexto).

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| nphSi/Z-Image-Lora | Colección de LoRA de personajes | Tongyi-MAI/Z-Image y Z-Image-Turbo | Apache 2.0 | Hugging Face, diffusers |
| Tongyi-MAI/Z-Image | Modelo de difusión texto-a-imagen completo | — | no disponible en la información | Hugging Face |
| Tongyi-MAI/Z-Image-Turbo | Variante acelerada del modelo base | Z-Image | no disponible en la información | Hugging Face |

No se dispone de información sobre otros repositorios de LoRA de personajes comparables ni de sus métricas, por lo que la comparación se limita a los componentes del propio ecosistema Z-Image.

## Limitaciones y advertencias

- **Riesgo legal y ético por suplantación de identidad**: el repositorio reproduce rostros de personas reales (actores, celebridades, figuras públicas e incluso personajes ficticios). Su uso para generar imágenes no consentidas, difamatorias o engañosas puede vulnerar derechos de imagen y normativa aplicable.
- **Licencia**: los adaptadores se declaran Apache 2.0, pero el modelo base Z-Image tiene sus propios términos que deben verificarse antes de cualquier uso comercial.
- **Dependencia estricta del disparador**: sin el token `vrtlxxxx` correcto, el LoRA no funciona; los términos genéricos no activan la identidad.
- **Censura y conocimiento interno del modelo base**: el autor advierte que ciertos nombres deben eliminarse del prompt por censura o confusión del modelo.
- **Sesgos**: el catálogo está muy sesgado hacia figuras femeninas del entretenimiento occidental, lo que puede amplificar sesgos de representación.
- **Alucinación visual**: los LoRA de identidad pueden producir rasgos inconsistentes o mezclas no deseadas al combinarse varios disparadores.
- **Sin información de idiomas ni de parámetros**: no es posible evaluar el soporte multilingüe ni el coste computacional exacto por adaptador.
- **Tamaño del repositorio**: 126,0 GB dificultan la descarga completa en entornos con almacenamiento limitado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/nphSi/Z-Image-Lora
- Índice de LoRA con descarga directa, previsualización e información: https://huggingface.co/spaces/nphSi/Lookalike-LoRA-Index
- Discusiones y soporte de la comunidad: https://huggingface.co/nphSi/Z-Image-Lora/discussions
- Modelo base Z-Image: https://huggingface.co/Tongyi-MAI/Z-Image
- Variante Z-Image-Turbo: https://huggingface.co/Tongyi-MAI/Z-Image-Turbo
- Hilo de la comunidad sobre el efecto del dataset en composición y pose: https://www.reddit.com/r/malcolmrey/comments/1rfal9b/does_character_lora_dataset_affect_zimage/

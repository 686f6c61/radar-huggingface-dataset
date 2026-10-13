# mlx-community/LFM2.5-24B-A2B-Preview-5bit

## Resumen

LFM2.5-24B-A2B-Preview es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Liquid AI, con 23.971.587.712 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token (de ahí el sufijo A2B). Esta ficha concreta no es el checkpoint original, sino la conversión a 5 bits para MLX publicada por mlx-community a partir de `lq-preview/LFM2.5-24B-A2B-Preview`, fijada a la revisión `f772950ce6f17d35af5469d00334b61a9c2fc034`.

El modelo pertenece a la familia LFM2.5, que según Liquid AI abarca desde LFM2.5-230M hasta este LFM2.5-24B-A2B, presentado como el miembro más grande y último de la familia. Su propuesta es ejecutar razonamiento y flujos de agente en dispositivo ("on-device"), con una ventana de contexto declarada de 131.072 tokens y una licencia LFM Open License v1.0.

Su relevancia práctica radica en la combinación de tamaño total grande (24B) con cómputo por token reducido (2B activos) y un export cuantizado de 16,48 GB de pesos, lo que lo hace desplegable en equipos Apple Silicon con memoria unificada en lugar de requerir clústeres de GPU. El nombre incluye "Preview", y el propio autor de la conversión advierte de que las comprobaciones realizadas son smoke tests, no una evaluación de calidad completa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); etiqueta de arquitectura `lfm2_moe` |
| Parametros totales | 23.971.587.712 |
| Parametros activos | Aproximadamente 2.000 millones por token (denominación A2B) |
| Longitud de contexto | 131.072 tokens (según la configuración del modelo de origen) |
| Tipos de cuantizacion | Affine weight-only de 5 bits con group size 64; proyecciones de router en affine 8 bits (group size 64); pesos no cuantizados en BF16; sesgos de enrutamiento de expertos en FP32 |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face); los términos concretos deben consultarse en el fichero LICENSE |
| Formato de pesos | safetensors en formato MLX (repositorio de 16,5 GB; pesos de 16,48 GB en base decimal) |
| Modelo base | lq-preview/LFM2.5-24B-A2B-Preview |
| Biblioteca de inferencia | mlx / mlx-vlm |
| Pipeline declarado | text-generation |
| Organizaciones que publican | mlx-community y nativ-community (ficheros idénticos) |
| Fecha de publicación | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE), tal como indican la etiqueta `lfm2_moe` y la nomenclatura A2B del modelo. Esto implica que en cada paso de decodificación solo se activa una fracción del total de parámetros, lo que reduce el coste computacional por token manteniendo la capacidad del modelo completo. La información disponible no detalla el número de expertos, la estrategia de enrutamiento, el mecanismo de atención ni si se emplean capas híbridas.

Respecto al entrenamiento, no se dispone de datos sobre volumen de tokens, composición del dataset ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; tampoco se documentan innovaciones de decodificación o atención más allá del propio esquema MoE. Lo que sí está documentado es el proceso de conversión y cuantización: se realizó con la CLI de MLX-VLM en un Apple M3 Ultra, con cuantización afín solo de pesos a 5 bits y group size 64, routers cuantizados a 8 bits, pesos no cuantizados en BF16 y sesgos de enrutamiento en FP32. El export se recargó con coincidencia estricta de pesos y se validó con generación greedy corta (respuestas "Paris" y "391" hasta EOS), además de comprobar que prefill y decodificación con caché producen logits finitos.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la plantilla de chat incluida.
- Razonamiento explícito: el modelo genera una traza de razonamiento antes de la respuesta final, por lo que conviene reservar suficientes tokens de salida.
- Eficiencia por token gracias al esquema MoE de 2B parámetros activos sobre un total de 24B.
- Cobertura multilingüe declarada para diez idiomas: inglés, árabe, chino, francés, alemán, japonés, coreano, español, portugués e italiano.
- Orientación a agentes en dispositivo: Liquid AI presenta la familia LFM2.5-24B-A2B como modelo para agentes rápidos y privados que se ejecutan localmente.
- Tool calling / function calling: no confirmado en la información disponible.
- Capacidades de visión: el repositorio incluye la etiqueta `mlx-vlm` y la conversión se hizo con la CLI de MLX-VLM, pero la model card afirma explícitamente que se trata de un modelo de generación de texto; no hay confirmación de entrada de imágenes.
- Modo "thinking" estructurado con formato propio: no se documenta más allá de la generación de razonamiento previo a la respuesta.

## Casos de uso

- Asistentes conversacionales locales: con 131.072 tokens de contexto declarados, el modelo puede mantener conversaciones multi-turno largas sobre documentación extensa sin salir del equipo, lo que resulta adecuado para escenarios con requisitos de privacidad.
- Agentes en dispositivo para Apple Silicon: al ocupar 16,48 GB de pesos en 5 bits y activar solo unos 2B parámetros por token, es viable ejecutarlo en un Mac con memoria unificada y usarlo como motor de un agente que llama a herramientas locales.
- Procesamiento de documentos largos: contratos, informes técnicos o bases de código pueden caber en la ventana de contexto, permitiendo tareas de resumen, extracción y pregunta-respuesta sobre el documento completo.
- Razonamiento asistido con traza visible: útil en entornos educativos o de depuración, donde interesa inspeccionar el razonamiento intermedio antes de la conclusión final.
- Atención al cliente multilingüe: los diez idiomas declarados permiten atender consultas en español, portugués, francés, alemán, árabe, chino, japonés o coreano con un único modelo desplegado en local.
- Prototipado e investigación en MoE: sirve como banco de pruebas para estudiar el comportamiento de un MoE de 24B con 2B activos, comparar cuantizaciones de 4 y 5 bits y medir el impacto de la cuantización en tareas de razonamiento.
- Automatización de tareas internas sin conexión: entornos con conectividad restringida o requisitos regulatorios que impiden enviar datos a APIs externas pueden ejecutar el modelo íntegramente en el puesto de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe comprobaciones de humo (smoke tests) consistentes en dos generaciones greedy cortas que devolvieron "Paris" y "391" y alcanzaron EOS, y advierte de que no constituyen una evaluación de calidad exhaustiva ni una prueba de contexto largo.

## Requisitos de hardware

- Peso de los ficheros: 16,48 GB en base decimal (repositorio de 16,5 GB), solo pesos; la memoria en tiempo de ejecución incluye además caché y asignaciones temporales.
- Memoria unificada recomendada: al menos 32 GB en un equipo Apple Silicon para el modelo y la caché de contexto a longitudes moderadas; para aprovechar la ventana de 131.072 tokens se necesita bastante más margen (estimación orientativa, no confirmada por el autor).
- Plataforma: MLX requiere Apple Silicon (familia M). La conversión se realizó y probó en un Apple M3 Ultra.
- GPU NVIDIA/AMD: este export no es utilizable en CUDA ni ROCm; no se documenta una variante GGUF o CUDA equivalente para este checkpoint Preview.
- Entorno de ejecución validado: MLX-VLM PR #2505 (commit `a6c7313bc053e5887616fa850808d21576eddf98`), MLX 0.32.3 y Transformers 5.17.0.
- Opciones de despliegue: `mlx-vlm` con el comando de generación documentado; no hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI para esta conversión concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| mlx-community/LFM2.5-24B-A2B-Preview-5bit (esta ficha) | 23,97B | ~2B | 131.072 tokens | MLX affine 5 bits, group size 64 | LFM Open License v1.0 | Hugging Face (mlx-community y nativ-community) |
| LiquidAI/LFM2-24B-A2B-MLX-5bit | 24B | 2B | no disponible | MLX 5 bits | LFM 1.0 | Hugging Face |
| mlx-community/LFM2-24B-A2B-4bit | 24B | 2B | no disponible | MLX 4 bits | LFM 1.0 | Hugging Face |
| lq-preview/LFM2.5-24B-A2B-Preview | 23,97B | ~2B | 131.072 tokens | BF16 sin cuantizar | LFM Open License v1.0 | Hugging Face |

La diferencia principal entre las dos primeras filas es la generación del modelo base: LFM2-24B-A2B frente a LFM2.5-24B-A2B. No se dispone de datos de rendimiento comparativos que permitan afirmar cuál es superior en tareas concretas.

## Limitaciones y advertencias

- Se trata de un checkpoint marcado como "Preview": no se han publicado benchmarks de calidad, y las únicas validaciones documentadas son dos generaciones greedy cortas.
- Riesgo de alucinación: no hay evaluación publicada al respecto; al generar razonamiento antes de responder, la traza intermedia puede contener errores que arrastren la conclusión final.
- La cuantización a 5 bits introduce pérdida de precisión frente al checkpoint BF16 original, y no se ha publicado ninguna medición de esa degradación.
- La ventana de 131.072 tokens procede de la configuración del modelo de origen; no se ha verificado con pruebas de contexto largo en esta conversión.
- Sesgos conocidos: no documentados en la información disponible. La cobertura de diez idiomas está declarada por el autor, sin datos de calidad por idioma.
- Licencia LFM Open License v1.0, no equivalente a Apache 2.0 ni MIT. Es imprescindible revisar el fichero LICENSE antes de un uso comercial; los términos concretos no están detallados en la información disponible.
- La conversión y cuantización son modificaciones de la comunidad sobre el checkpoint original de Liquid AI; la atribución y los cambios se describen en el fichero NOTICE.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación de la comunidad sobre este export.
- El comando de ejemplo de la model card apunta a la ruta `nativ-community/LFM2.5-24B-A2B-Preview-5bit`, mientras que el identificador de esta ficha es `mlx-community/...`; ambos repositorios publican ficheros idénticos, pero conviene comprobar la ruta usada en producción.
- No hay confirmación de soporte de tool calling, function calling ni visión en este export.
- Dependencia de versiones concretas de MLX-VLM, MLX y Transformers para su correcto funcionamiento; otras versiones pueden no cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlx-community/LFM2.5-24B-A2B-Preview-5bit
- Copia idéntica en otra organización: https://huggingface.co/nativ-community/LFM2.5-24B-A2B-Preview-5bit
- Modelo base (checkpoint original): https://huggingface.co/lq-preview/LFM2.5-24B-A2B-Preview
- PR de soporte de LFM2.5 en MLX-VLM: https://github.com/Blaizzy/mlx-vlm/pull/2505
- Anuncio de Liquid AI sobre LFM2.5-24B-A2B: https://www.liquid.ai/blog/lfm2-5-24b-a2b
- Cobertura de la publicación: https://www.unite.ai/liquid-ai-releases-open-weight-lfm2-5-24b-a2b-for-on-device-agents/
- Cuantización MLX de 5 bits de la generación anterior: https://huggingface.co/LiquidAI/LFM2-24B-A2B-MLX-5bit
- Cuantización MLX de 4 bits de la generación anterior: https://huggingface.co/mlx-community/LFM2-24B-A2B-4bit
- Ficha agregada de la versión LM Studio: https://inferix.co/models/lmstudio-community/LFM2-24B-A2B-MLX-5bit

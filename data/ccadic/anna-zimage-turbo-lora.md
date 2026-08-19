# Ccadic/Anna-ZImage-Turbo-LoRA

## Resumen

Anna es una LoRA de personaje original y ficticio creada por Ccadic para el modelo base Tongyi-MAI/Z-Image-Turbo. Se trata de un adaptador de tipo character LoRA diseñado para preservar la identidad facial de una personaje femenina ficticia a través de distintos ángulos de cámara, expresiones, peinados, vestuarios, condiciones de iluminación y escenarios. El objetivo es que funcione como una "actriz virtual" reutilizable para narración visual, previsualización cinematográfica, concept art y producción virtual, en lugar de un retrato fijo.

El adaptador se distribuye en un único archivo Safetensors en formato BF16 de aproximadamente 0,1 GB, entrenado con 2.000 pasos, rango/alpha 16/16, optimizador AdamW 8-bit y scheduler de ruido FlowMatch. La palabra de activación es `ana_biosyn` y la fuerza recomendada de LoRA está entre 0,8 y 1,0. Está pensado para usarse con ComfyUI y el flujo de trabajo FlowMatch nativo de Z-Image Turbo.

Su relevancia radica en que permite mantener la consistencia de identidad de un personaje ficticio en generaciones de imágenes, un reto habitual en proyectos de narrativa visual, y lo hace bajo licencia Apache 2.0, lo que facilita su integración en pipelines comerciales sin costes adicionales de licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (Low-Rank Adaptation) para Z-Image Turbo |
| Parametros totales | No disponible (archivo de 0,1 GB en repositorio) |
| Parametros activos | No aplica (adaptador LoRA) |
| Longitud de contexto | No aplica (generación de imagen) |
| Tipos de cuantizacion | BF16 (Safetensors) |
| Idiomas soportados | Inglés (prompts) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors BF16 |

## Arquitectura y entrenamiento

La LoRA se entrena como adaptador sobre el modelo base Z-Image Turbo de Tongyi-MAI, un modelo de texto a imagen basado en FlowMatch. El adaptador inyecta matrices de bajo rango (rank 16, alpha 16) en las capas del modelo base, de modo que solo se ajusta una fracción mínima de los parámetros totales. El text encoder permanece congelado durante el entrenamiento, lo que reduce el coste computacional y evita la deriva semántica.

El entrenamiento se realizó con 2.000 pasos, precisión BF16, optimizador AdamW 8-bit y scheduler de ruido FlowMatch. La resolución de entrenamiento fue de 512 a 768 píxeles y la de generación recomendada es de 768 a 1024 píxeles. El objetivo declarado es un equilibrio entre preservación de identidad y flexibilidad del prompt: la LoRA controla la identidad del personaje, mientras que escena, vestuario, pose, expresión, cámara e iluminación deben describirse en el prompt.

## Capacidades

- Generación de imágenes de un personaje ficticio consistente en primeros planos, planos medios, tres cuartos, perfil y cuerpo completo.
- Control de identidad facial: pelo castaño muy oscuro, ojos gris-verdosos y rasgos mediterráneos, mantenidos en distintas condiciones de iluminación y escenarios.
- Expresiones variadas: neutra, tristeza contenida, determinación, mirada directa, entre otras.
- Vestuario y ambientación flexible: contemporáneo, histórico, ciencia ficción y fantasía.
- Compatible con ComfyUI mediante el flujo FlowMatch nativo de Z-Image Turbo.
- Palabra de activación `ana_biosyn` que debe colocarse al inicio del prompt para reforzar la identidad.
- Inferencia rápida: 8 a 9 pasos de muestreo con guidance 1.

## Casos de uso

- **Previsualización cinematográfica**: generar storyboards y planos de una misma actriz en distintas localizaciones, iluminaciones y momentos narrativos, manteniendo la identidad del personaje para evaluar dirección y encuadre antes del rodaje.
- **Concept art para videojuegos**: diseñar variantes de vestuario, armas y poses de un personaje original para producción de concept, con la misma base facial en todas las iteraciones.
- **Novelas visuales y cómics**: producir paneles de una narrativa gráfica con la misma protagonista en escenas variadas, reduciendo la inconsistencia visual entre viñetas.
- **Producción virtual**: generar escenas de previsualización para sets virtuales, pruebas de iluminación y dirección de actores virtuales en proyectos de filmación con tecnología LED.
- **Campañas de marketing**: crear una imagen de persona ficticia consistente para anuncios, redes sociales y material publicitario, sin depender de modelos reales ni de sesiones fotográficas.
- **Proyectos de ficción interactiva**: generar imágenes para juegos de rol, contenido interactivo o demos de producto donde el personaje debe aparecer de forma coherente en contextos muy distintos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al tratarse de un adaptador de personaje para generación de imágenes, no existen métricas estándar tipo MMLU o HumanEval; la evaluación se realiza de forma visual y subjetiva, midiendo la consistencia de identidad entre generaciones.

## Requisitos de hardware

- El archivo de la LoRA ocupa aproximadamente 0,1 GB, por lo que el coste adicional de memoria es mínimo.
- El modelo base Z-Image Turbo requiere una GPU con VRAM suficiente para inferencia de imagen; no se especifica el requisito mínimo en la documentación disponible.
- Se puede ejecutar en GPUs de consumo (RTX 3090, RTX 4090) si el modelo base cabe en su VRAM, aunque no se confirma el límite exacto.
- La interfaz de despliegue recomendada es ComfyUI con el flujo FlowMatch nativo de Z-Image Turbo.
- Latencia y throughput: no se publican cifras concretas; el muestreo de 8 a 9 pasos sugiere tiempos de generación relativamente bajos, pero no hay datos verificables.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Rango/Alpha | Pasos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ccadic/Anna-ZImage-Turbo-LoRA | LoRA de personaje | Z-Image Turbo | 16/16 | 2.000 | Apache 2.0 | HuggingFace |
| Tekken-Anna_Williams-Z-Image Turbo (Civitai) | LoRA de personaje | Z-Image Turbo | No disponible | 3.500 | No especificada | Civitai |
| Lookalike LoRA Index (nphSi) | Índice de LoRAs | Z-Image Base/Turbo | No disponible | No disponible | No especificada | HuggingFace Space |

La comparación directa no es posible porque no se publican métricas objetivas de consistencia de identidad. La principal diferencia de Anna es que se trata de un personaje original (no una franquicia ni una persona real) y su licencia Apache 2.0 permite uso comercial sin restricciones adicionales. El índice de nphSi agrupa más de 1.300 LoRAs compatibles con Z-Image Base y Turbo, lo que indica un ecosistema amplio de adaptadores de personaje.

## Limitaciones y advertencias

- La consistencia de identidad puede degradarse en planos de cuerpo completo muy distantes o con ángulos de cámara extremos.
- La oclusión facial intensa, el renderizado muy estilizado o la iluminación extrema pueden reducir el parecido con la identidad de Anna.
- En escenas complejas con varios personajes femeninos similares, puede producirse mezcla de identidades.
- La fuerza recomendada (0,8 a 1,0) está aún en evaluación y puede ajustarse en futuras versiones del adaptador.
- Los resultados dependen de la versión exacta del flujo de trabajo de ComfyUI y de la versión del modelo base Z-Image Turbo.
- Aunque Anna es un personaje ficticio y no representa a ninguna persona real, se recomienda verificar que las generaciones no guarden parecido con personas reales antes de un uso comercial público.
- La licencia Apache 2.0 permite uso comercial, pero no se incluyen garantías sobre el contenido generado ni sobre la ausencia de similitud con personas reales.

## Enlaces

- [HuggingFace - Ccadic/Anna-ZImage-Turbo-LoRA](https://huggingface.co/Ccadic/Anna-ZImage-Turbo-LoRA)
- [Modelo base - Tongyi-MAI/Z-Image-Turbo](https://huggingface.co/Tongyi-MAI/Z-Image-Turbo)
- [Civitai - Anna AI Model](https://civitai.red/models/2535358/anna-ai-model?modelVersionId=2849406)
- [ZImageTurbo - LoRA Training](https://zimageturbo.com/lora-train)
- [TurboLora - LoRA Training](https://turbolora.com/)
- [Lookalike LoRA Index - HuggingFace Space](https://huggingface.co/spaces/nphSi/Lookalike-LoRA-Index)
- [Tekken-Anna_Williams-ZImage Turbo - Civitai](https://civitai.red/models/2415686/tekken-anna-williams-z-image-turbo)

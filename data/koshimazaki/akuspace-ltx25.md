# KoshiMazaki/akuspace-ltx25

## Resumen

AKUSPACE es un adaptador LoRA de audio para el modelo base Lightricks/LTX-2.5, desarrollado por KoshiMazaki. Su función es transformar audio de referencia (seco) para situarlo en un entorno acústico concreto —salas, catedrales, exteriores o efectos modulares— preservando la sincronización temporal con el vídeo. Está pensado para flujos de generación de vídeo con audio sincronizado, donde el audio tratado se mantiene fijo mientras el vídeo se genera a partir de la primera imagen.

El modelo se entrena sobre 266 pares de clips (seco/procesado) y se distribuye como un LoRA de rango 32 que se acopla a los módulos de atención y feed-forward de la rama de audio de LTX-2.5. El repositorio ocupa 0,2 GB e incluye el checkpoint del paso 11.500 de un entrenamiento de 12.300 pasos. La licencia es la comunidad de LTX-2, con restricciones de uso comercial que deben revisarse.

La relevancia actual radica en que LTX-2.5 es uno de los pocos modelos abiertos de generación de vídeo con audio nativo, y AKUSPACE amplía su control acústico sin necesidad de reentrenar el modelo completo. El adaptador no genera audio desde texto: requiere una referencia de audio seca y un caption completo con la palabra de activación `AKUSPACE`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre LTX-2.5 (transformer de 22B parámetros, bf16) |
| Parametros totales | no disponible (LoRA de rango 32, tamaño de repo 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (clips de entrenamiento de 6,000 s a 48 kHz) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (captions en inglés, sin especificación oficial) |
| Licencia | ltx-2-community-license-agreement (ver enlace) |
| Formato de pesos | no especificado (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

AKUSPACE es un LoRA de rango 32 (alpha 32, dropout 0) que se inserta en los módulos `audio_attn1`, `audio_attn2` y `audio_ff` de la rama de audio del modelo base LTX-2.5. El entrenamiento se realizó con el LTX Trainer oficial sobre 266 clips pareados (228 de entrenamiento, 38 de validación), donde cada elemento es la misma interpretación grabada dos veces: una seca y otra procesada con un tratamiento acústico real (reverberaciones digitales, presets personalizados, patches modulares Eurorack y grabaciones de campo). Esto fuerza al modelo a aprender una transformación, no una asociación.

El dataset se organizó como una cuadrícula deliberada: 14 fuentes de audio (voces, ritmos, percusión, instrumentos acústicos) y 19 celdas de tratamiento, de modo que ningún espacio queda definido por una sola voz ni ninguna voz por un solo espacio. Se entrenaron 5 versiones (v1→v5); la versión publicada es el paso 11.500 de la v5, seleccionado por evaluación auditiva. El optimizador fue AdamW con learning rate 2e-4, batch 1, bf16 y semilla 42. Todos los materiales son propios del autor, sin scraping ni audio con licencia de terceros.

## Capacidades

- Transformación audio-audio: coloca el audio de referencia en un entorno acústico indicado por prompt (salas, catedral, exteriores, efectos de delay).
- Control de intensidad mediante palabras de nivel (`gentle`, `moderate`, `heavy`) integradas en el caption.
- Preservación de la sincronización temporal: la evaluación muestra un offset de 16–24 ms respecto a la referencia seca, dentro del margen de sincronización labial.
- Soporte de espacios interiores (small room, medium room, empty club, cathedral) y exteriores (outdoor day, outdoor night).
- Efecto de sonido específico: Dual Delay (derivado de parches Eurorack).
- Integración con ComfyUI mediante nodos personalizados (ComfyUI-Koshi-Nodes).
- No genera audio desde texto: requiere una referencia de audio seca; sin referencia produce casi silencio.
- No es una simulación acústica físicamente precisa, sino una transformación generativa.

## Casos de uso

- Postproducción de diálogos para vídeo: añadir reverberación de sala o catedral a una pista de voz seca, manteniendo la sincronización con el movimiento de los labios en un clip generado con LTX-2.5.
- Diseño de sonido para cine y videojuegos: situar efectos de sonido o música en espacios concretos (club vacío, baño pequeño) con niveles de ambiente controlados.
- Creación de ambientes sonoros para realidad virtual: generar paisajes acústicos exteriores (día/noche) a partir de grabaciones secas, con capas de ambiente separadas.
- Ajuste de acústica en podcasts o grabaciones de estudio: aplicar un carácter espacial a voces o instrumentos sin necesidad de hardware físico de reverberación.
- Restauración de audio seco con ambiente natural: dar vida a grabaciones anecoicas añadiendo reflexiones tempranas y cola de reverberación de forma controlada.
- Flujos de generación de vídeo con audio sincronizado: integrar el adaptador en un pipeline de ComfyUI donde el audio tratado se fija y el vídeo se genera condicionado a la primera imagen, manteniendo coherencia audiovisual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, etc.) porque se trata de un adaptador de audio, no de un modelo de lenguaje. La única evaluación disponible es la medición de sincronización temporal sobre seis ejemplos publicados, con correlación cruzada de envolvente a 2 ms de resolución:

| Ejemplo | Offset | Correlación pico (r) |
|---|---|---|
| Voz · sala pequeña | −20 ms | 0,96 |
| Voz · catedral | −22 ms | 0,97 |
| Ritmo · sala mediana | −16 ms | 0,34 |
| Ritmo · club vacío | −20 ms | 0,30 |
| Ritmo · exterior día | −24 ms | 0,32 |
| Ritmo · dual delay | −22 ms | 0,34 |

El autor advierte que la correlación baja en percusión es esperable: la reverberación rellena los huecos entre golpes, alterando la envolvente por diseño. Es una medida de tiempo, no de calidad.

## Requisitos de hardware

- El LoRA en sí es ligero (0,2 GB), pero requiere cargar el modelo base LTX-2.5 (22B parámetros en bf16) para funcionar.
- No se especifican requisitos de VRAM en la documentación. Como referencia, un modelo de 22B en bf16 necesita al menos 44 GB de VRAM solo para los pesos, más el overhead de activaciones y el adaptador.
- Se recomienda una GPU con 48 GB o más (por ejemplo, A6000, A100 80GB, H100) para inferencia con el modelo base completo. En consumer, una RTX 4090 (24 GB) podría funcionar con cuantización del modelo base, pero no está confirmado.
- Opciones de despliegue: el adaptador está diseñado para usarse con LTX-2.5 y los nodos de ComfyUI (ComfyUI-Koshi-Nodes). También puede integrarse en pipelines de Python con la librería `ltx` (según el tag de HuggingFace).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No se han encontrado otros adaptadores LoRA de audio para LTX-2.5 con características comparables en la información proporcionada. El modelo base LTX-2.5 es el punto de referencia, pero AKUSPACE es específico para transformación acústica.

## Limitaciones y advertencias

- Requiere una referencia de audio; no genera un espacio acústico a partir de texto solo.
- Es una transformación generativa, no una simulación acústica físicamente precisa.
- El audio se regenera, no se filtra: la redacción, el tiempo, el tono o el timbre pueden cambiar.
- El ambiente exterior puede enmascarar fuentes sonoras suaves.
- El eje de nivel (`gentle`/`moderate`/`heavy`) es un control aprendido por caption, no un porcentaje seco/húmedo calibrado.
- Los captions parciales funcionan peor que los completos; las cláusulas finales estaban presentes en todos los captions de entrenamiento.
- Se debe desactivar el prompt enhancement del modelo base, ya que reescribe la palabra de activación y el nivel.
- La licencia `ltx-2-community-license-agreement` puede imponer restricciones de uso comercial; es necesario revisar el texto completo.
- El nivel `heavy` en exteriores se considera experimental (fuera del rango entrenado).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KoshiMazaki/akuspace-ltx25
- Estudio audiovisual interactivo: https://akuspace.pages.dev
- Nodos de ComfyUI: https://github.com/koshimazaki/ComfyUI-Koshi-Nodes
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE.md
- Modelo base LTX-2.5 (Diffusers): https://huggingface.co/Lightricks/LTX-2.5-Diffusers

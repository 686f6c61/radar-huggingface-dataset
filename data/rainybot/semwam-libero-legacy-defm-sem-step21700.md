# RainyBot/SemWAM-LIBERO-Legacy-defm-sem-step21700

## Resumen

SemWAM-LIBERO-Legacy-defm-sem-step21700 es un checkpoint histórico de un modelo de robótica desarrollado por el usuario RainyBot, entrenado sobre el benchmark LIBERO. Se trata de la instantánea final (paso de optimizador 21700/21700) de un entrenamiento que combina un backbone de difusión de vídeo Wan2.2-TI2V-5B con codificadores congelados de semántica (DINOv3 ViT-B/16) y de profundidad (DEFM ViT-S/14 con estimador VDA). El modelo se publica como archivo de preservación, byte a byte, del checkpoint original previo a la versión 2 del formato.

La relevancia de esta ficha es limitada y muy específica: no se trata de un modelo listo para producción ni de una release evaluable con el stack actual. El propio autor advierte que el checkpoint carece de `checkpoint_version=2` y de `inference_config`, y que no es compatible con el evaluador SemWAM v2. Su interés es arqueológico o de reproducibilidad: conserva la receta exacta de un experimento de investigación en manipulación robótica con planificación condicionada por semántica y profundidad.

No se dispone de información sobre el número de parámetros totales, la longitud de contexto, los idiomas soportados ni la licencia. El repositorio ocupa 12,1 GB y los pesos se almacenan en `torch.bfloat16`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | dep_sem (difusión de vídeo Wan2.2-TI2V-5B con fusión de semántica y profundidad) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pytorch (bfloat16), sin confirmar safetensors |
| Tamano del repositorio | 12,1 GB |
| Paradigma de entrada | t_concat |
| Layout de vistas | libero_horizontal |
| Backbone semántico | dinov3_vitb16 (feat_dim 768) |
| Backbone de profundidad | defm_vit_s14 (feat_dim 384, patch 14) |
| Estimador de profundidad | vda (ViT-B, input_size 518) |
| Dimension propioceptiva | 8 |
| Capas de fusión semántica | 7, 23 |
| Paso de optimizador final | 21700 / 21700 |
| Tipo de checkpoint | histórico (pre-v2, sin inference_config) |

## Arquitectura y entrenamiento

La arquitectura declarada es `dep_sem`, construida sobre el modelo de difusión de vídeo Wan2.2-TI2V-5B. El modelo incorpora dos ramas de representación congeladas: una semántica basada en DINOv3 ViT-B/16 con dimensión de característica 768, y una de profundidad basada en DEFM ViT-S/14 (dimensión 384, parches de 14 píxeles) con estimador VDA de ViT-B a resolución 518. Las características semánticas se fusionan en las capas 7 y 23 del transformer de vídeo, con pooling temporal de tipo media. La observación incluye una vista de muñeca de 128x160 píxeles (frame "first", sin atención al vídeo, cámaras izquierda y derecha) y un vector propioceptivo de 8 dimensiones.

El entrenamiento se realizó sobre el benchmark LIBERO con un layout de vistas horizontal y un paradigma de entrada `t_concat`. El mask de atención de vídeo es `first_frame_causal` y el modelo no está condicionado por acción (`action_conditioned: false`). La configuración de profundidad incluye normalización de mapas de puntos con límites x e y en [-0,6, 0,6] y z en [0,0, 1,5], profundidad máxima de 2,0 m y mapa de color turbo. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El autor indica que la revisión del código fuente original de entrenamiento es desconocida y que los campos ausentes en la configuración resuelta deben considerarse desconocidos, no falsos.

## Capacidades

- Modelo de robótica orientado a manipulación sobre el benchmark LIBERO; no es un modelo de lenguaje general.
- Generación de trayectorias o acciones condicionadas por observación visual, profundidad y estado propioceptivo (8 dimensiones).
- Fusión de características semánticas (DINOv3) en capas intermedias del transformer de vídeo para guiar la planificación.
- Representación de profundidad mediante DEFM con estimador VDA y mapa de puntos normalizado.
- Entrada multimodal con vistas de cámara izquierda, derecha y muñeca en layout horizontal.
- No consta soporte de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No consta capacidad multilingüe ni modo de pensamiento (thinking mode).
- No consta soporte de audio ni de visión general fuera del pipeline robótico.

## Casos de uso

- Reproducción de experimentos de investigación: el checkpoint permite replicar exactamente el estado final del entrenamiento (paso 21700) usando la implementación histórica y la configuración original, imprescindible para auditar resultados publicados.
- Archivado y trazabilidad de experimentos: sirve como referencia byte a byte de una receta concreta (`dep_sem`, `t_concat`, `libero_horizontal`) para comparar con futuras versiones del stack SemWAM.
- Estudio de fusión semántica en políticas robóticas: las capas de fusión 7 y 23 con DINOv3 permiten analizar cómo influye la semántica congelada en la generación de acciones dentro de LIBERO.
- Estudio de representaciones de profundidad: la combinación DEFM + VDA con mapa de puntos normalizado es útil para investigar cómo la geometría condiciona la planificación en entornos simulados.
- Base para migración a v2: aunque no es compatible con el evaluador actual, el checkpoint puede servir de punto de partida para conversiones controladas al nuevo formato, siempre con la implementación histórica como referencia.
- Docencia y formación: como ejemplo documentado de checkpoint histórico con metadatos completos (intrínsecos, bounds, configuración de cámaras) para enseñar buenas prácticas de preservación de experimentos.
- Comparación de layouts de observación: el layout `libero_horizontal` con vista de muñeca de 128x160 permite estudiar el impacto del diseño de vistas en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio ocupa 12,1 GB en bfloat16, por lo que se requiere al menos esa cantidad de memoria más overhead de activaciones y codificadores congelados.
- GPU recomendadas: no disponible. Por tamaño de pesos, una GPU con 24 GB o más (RTX 4090, A100 40 GB, H100) es el mínimo razonable; no confirmado por el autor.
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en bfloat16, aunque no está confirmado y depende del pipeline completo (Wan2.2 + DINOv3 + DEFM + VDA).
- Opciones de despliegue: no disponible. El autor indica que requiere la implementación histórica y la configuración original; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (políticas robóticas sobre LIBERO) en la información disponible.

## Limitaciones y advertencias

- Checkpoint histórico pre-v2: no incluye `checkpoint_version=2` ni `inference_config`, y no es compatible con el evaluador SemWAM v2 actual.
- Requiere la implementación histórica y la configuración original; la revisión del código fuente de entrenamiento es desconocida.
- No es una release de migración ni una afirmación de compatibilidad con la evaluación actual; el autor lo describe explícitamente como release de archivo.
- Los campos ausentes en la configuración resuelta deben tratarse como desconocidos, no como desactivados; los valores registrados pueden estar inactivos según los gates de arquitectura.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución.
- Idiomas no disponibles; el modelo no es un modelo de lenguaje, por lo que la evaluación multilingüe no aplica.
- Riesgo de alucinación y sesgos: no evaluados ni documentados para este checkpoint.
- Uso previsto limitado a investigación en robótica sobre LIBERO; no se recomienda su uso en producción sin validación adicional.
- Sin descargas ni likes en el momento de la consulta; sin evidencia de validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/RainyBot/SemWAM-LIBERO-Legacy-defm-sem-step21700

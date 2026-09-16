# rodrig-obarbo/classification-proto

## Resumen

`rodrig-obarbo/classification-proto` es un repositorio de HuggingFace publicado por el usuario rodrig-obarbo que contiene una implementación mínima de una arquitectura Mixer orientada a tareas de clasificación. No es un modelo entrenado ni un release con resultados: la propia model card lo describe como un punto de partida reproducible cuyo checkpoint (`model.safetensors`) es válido únicamente para pruebas de humo (*smoke tests*).

El modelo declara 16.576 parámetros totales, un orden de magnitud propio de un prototipo de laboratorio más que de un sistema desplegable. La configuración registrada indica arquitectura Mixer, escala "base", atención de ventana deslizante, fusión de bajo rango, activación GELU y normalización mediante BatchNorm. Se distribuye bajo licencia BSD-3-Clause en formato safetensors, acompañado de `config.json`, `training_args.json` y el script `predict.py`, que actúa como artefacto principal.

Su relevancia es acotada y explícita: sirve como esqueleto para experimentos de clasificación y para validar infraestructura de entrenamiento y evaluación, no como solución lista para producción. No se publican benchmarks, no se declaran idiomas soportados y el autor advierte de que los pesos no han sido entrenados ni auditados en robustez, equidad o transferencia de dominio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixer (familia MLP-Mixer), escala "base", atención de ventana deslizante, fusión de bajo rango |
| Parametros totales | 16.576 |
| Longitud de contexto | no disponible (modelo de clasificación, no generativo) |
| Tipos de cuantizacion | no disponible (solo se publica el checkpoint en safetensors; no se documentan variantes GGUF, int8 ni int4) |
| Idiomas soportados | no disponible |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (PyTorch); incluye `predict.py` como punto de entrada |
| Funcion de activacion | GELU |
| Normalizacion | BatchNorm |
| Tamano del repositorio | 0,0 GB (aproximadamente 65 KB si el checkpoint está en fp32) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Mixer, es decir, una red basada en mezclas de tipo MLP (sin mecanismo de autoatención clásico tipo transformer), con dos detalles declarados en la configuración: atención de ventana deslizante y fusión de bajo rango (*low rank*). La activación es GELU y la normalización es BatchNorm, lo que apunta a un diseño pensado para clasificación supervisada sobre representaciones fijas más que para generación autorregresiva.

En cuanto al entrenamiento, no hay entrenamiento documentado. El repositorio publica un checkpoint de inicialización y una receta de experimento por defecto basada en AdamW con un esquema de *linear warmup*. El autor subraya que esos valores son puntos de partida del script y no evidencia de una ejecución completada, y recomienda que cualquier evaluación futura entrene todos los baselines con la misma exposición de datos, presupuesto de ajuste y semillas aleatorias. No se declaran número de tokens, composición del dataset, ni etapas de RLHF o DPO.

## Capacidades

- Clasificación: la arquitectura está diseñada para tareas de clasificación supervisada (etiquetado de entradas en categorías), no para generación de texto.
- Punto de entrada ejecutable: `predict.py` incluye un bloque `__main__` con un ejemplo de prueba de humo; se puede inspeccionar con `python predict.py --help`.
- Configuración explícita y reproducible: `config.json` recoge los ajustes de arquitectura y `training_args.json` la receta de experimento por defecto.
- No dispone de soporte de *tool calling* ni de *function calling*.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingües declaradas (no se especifican idiomas).
- No dispone de modo *thinking*, visión, audio ni otras capacidades especiales.
- Los pesos actuales no están entrenados: no ejecutan ninguna tarea útil sin un entrenamiento previo por parte del usuario.

## Casos de uso

- Prototipado de pipelines de clasificación: sirve como componente inicial para montar un flujo de datos, un bucle de entrenamiento y una métrica de evaluación antes de invertir en una arquitectura mayor; su tamaño de 16.576 parámetros permite iterar en segundos.
- Pruebas de humo en CI/CD: al ser un checkpoint de inicialización válido, se puede cargar en un *job* de integración continua para verificar que el entorno, las versiones de PyTorch y el *forward pass* funcionan, sin coste de GPU.
- Investigación de ablaciones sobre la familia Mixer: permite comparar variantes de atención de ventana deslizante, fusión de bajo rango, GELU frente a otras activaciones y BatchNorm frente a LayerNorm con un coste computacional mínimo.
- Baseline de capacidad reducida en experimentos controlados: el autor recomienda explícitamente incluir un baseline de capacidad equivalente; este modelo puede actuar como ese baseline emparejado frente a alternativas más grandes.
- Material docente y reproducción de experimentos: útil para explicar la diferencia entre un checkpoint inicializado y un checkpoint entrenado, y para enseñar a auditar model cards.
- Validación de infraestructura de evaluación: permite comprobar la mecánica de *splits* etiquetados, cálculo de métricas específicas de tarea y repetición sobre al menos tres semillas aleatorias, tal y como sugiere la model card.
- Desarrollo de adaptadores de carga: al ser una implementación propia, obliga a escribir un adaptador explícito para las APIs automáticas; es un caso práctico para probar la integración de modelos personalizados en un *framework* interno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma explícita que no se reclama ninguna puntuación de benchmark en el repositorio, y que el checkpoint es una inicialización no entrenada. Cualquier cifra que se publique en el futuro deberá documentarse por separado de los valores por defecto aquí incluidos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 65 KB en fp32 (16.576 parámetros × 4 bytes) y unos 33 KB en fp16. Es un modelo que cabe holgadamente en memoria de cualquier dispositivo.
- GPU recomendadas: no se requiere GPU. Cualquier GPU, incluida una integrada o una NVIDIA GTX 1050 o superior, es más que suficiente; tarjetas como RTX 4090, A100 o H100 no aportan ninguna ventaja relevante por el tamaño del modelo.
- CPU: es plenamente funcional en CPU, que es la opción recomendada para pruebas de humo y experimentos de ablación.
- GPU de consumo: sí, cabe en cualquier GPU de consumo actual y también en dispositivos de borde tipo Raspberry Pi.
- Opciones de despliegue: al no ser un modelo generativo de lenguaje, no aplican vLLM, llama.cpp, Ollama ni TGI. El despliegue se realiza mediante el script PyTorch incluido o integrándolo en un servicio propio. No se documenta compatibilidad con TorchScript, ONNX ni otros formatos exportados.
- Latencia y throughput estimados: no disponibles (no se publican mediciones de latencia ni de rendimiento).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| classification-proto | 16.576 | no disponible (clasificación) | sin benchmarks publicados | BSD-3-Clause | HuggingFace, checkpoint sin entrenar |
| MLP-Mixer (referencia arquitectónica) | no disponible | no disponible | no disponible | no disponible | referencia académica |
| ResMLP (referencia arquitectónica) | no disponible | no disponible | no disponible | no disponible | referencia académica |
| gMLP (referencia arquitectónica) | no disponible | no disponible | no disponible | no disponible | referencia académica |

No se dispone de datos comparativos cuantitativos en la información proporcionada. MLP-Mixer, ResMLP y gMLP se citan únicamente como familias arquitectónicas emparentadas con el diseño Mixer; sus cifras de parámetros, contexto y rendimiento no están incluidas en la documentación consultada y no se reproducen aquí. La comparación directa de rendimiento no es posible porque este repositorio no publica ninguna métrica.

## Limitaciones y advertencias

- El checkpoint no está entrenado: no alcanzará un rendimiento útil en ninguna tarea real sin un entrenamiento previo con datos etiquetados del dominio objetivo.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según declara el propio autor.
- No se han publicado evaluaciones de sesgo para este modelo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero existe riesgo de resultados sin significado predictivo si se usa el checkpoint sin entrenar.
- No se declaran idiomas soportados, por lo que no puede asumirse cobertura multilingüe.
- No se define longitud de contexto ni ventana de entrada máxima en la información disponible.
- Implementación personalizada: las APIs de carga automática de HuggingFace requieren un adaptador explícito antes de poder usarlo.
- Licencia BSD-3-Clause: permite uso comercial y modificación con conservación del aviso de copyright y la cláusula de exención de responsabilidad; deben revisarse por separado los términos de los conjuntos de datos externos que se utilicen con el modelo.
- Para producción, no debe presentarse ningún resultado derivado de este repositorio sin documentar el entrenamiento completo, las semillas, las versiones de entorno y los *logs* asociados.
- El repositorio tiene 0 descargas y 0 *likes*, por lo que no existe validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/rodrig-obarbo/classification-proto
- Paper, blog, repositorio o demo adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relacionados con el modelo; los resultados obtenidos correspondían a contenidos no vinculados (páginas sobre una calle de Glasgow) y se descartan por no ser pertinentes.

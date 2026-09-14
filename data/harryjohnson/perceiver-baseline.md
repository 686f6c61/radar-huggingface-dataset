# HarryJohnson/perceiver-baseline

## Resumen

Este repositorio, publicado por el usuario HarryJohnson bajo el identificador `HarryJohnson/perceiver-baseline`, no es un modelo entrenado sino un esqueleto de código experimental para una arquitectura Perceiver orientada a aprendizaje contrastivo. El propio autor lo describe como una base para inspeccionar cambios de arquitectura antes de lanzar un entrenamiento completo, y el checkpoint `model.safetensors` se presenta explícitamente como una inicialización válida para pruebas de humo, no como un modelo con rendimiento demostrado. El peso real del checkpoint es de 24.832 parámetros, un tamaño insignificante en términos de capacidad funcional.

El interés del repositorio es, por tanto, metodológico y no de producto: fija una configuración concreta (atención de consultas agrupadas, fusión tipo Tucker, activación GELU aproximada, normalización ScaleNorm) y una receta de entrenamiento por defecto con el optimizador NovoGrad y un scheduler de tipo step. Su relevancia actual es limitada para producción, pero puede servir como plantilla reproducible para quien quiera montar un banco de pruebas de arquitecturas Perceiver con fusión multimodal y comparar variantes bajo el mismo presupuesto de datos, ajuste y semillas aleatorias.

La licencia BSD-3-Clause permite uso comercial y modificación, pero el autor advierte de que el checkpoint no ha sido entrenado ni auditado en robustez, equidad o transferencia de dominio. Cualquier resultado publicado deberá documentarse por separado de los valores por defecto que se incluyen aquí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 24.832 (según `model.safetensors`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se documentan formatos cuantizados) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors, más `config.json` y `training_args.json`; PyTorch |

Otros parámetros de arquitectura declarados en la model card: escala nominal "giant", atención de consultas agrupadas (grouped query), fusión Tucker, activación approx GELU, normalización ScaleNorm, optimizador NovoGrad y scheduler de tipo step.

## Arquitectura y entrenamiento

La arquitectura es un Perceiver, un transformer de cuello de botella latente que proyecta entradas de tamaño arbitrario (texto, imagen, audio o combinaciones) a un conjunto fijo de latentes mediante atención cruzada, y después aplica auto-atención sobre esos latentes. En esta variante concreta, la atención es de consultas agrupadas, la fusión entre modalidades se realiza con un esquema Tucker y la normalización es ScaleNorm en lugar de LayerNorm. El objetivo declarado del repositorio es contrastivo, aunque no se especifica la función de pérdida ni la composición del dataset.

No hay datos de entrenamiento disponibles: no se indica número de tokens, composición del corpus, ni si hubo RLHF, DPO u otra fase de alineamiento. La receta por defecto usa NovoGrad con schedule de tipo step, pero el autor subraya que son valores de partida del script, no evidencia de una ejecución completada. El `model.safetensors` es únicamente una inicialización válida para pruebas de humo. La etiqueta "giant" en la configuración resulta engañosa frente a los 24.832 parámetros reales del checkpoint; no hay evidencia de que se haya materializado ninguna escala grande.

## Capacidades

- Generación de texto: no disponible; no hay evidencia de que el checkpoint produzca texto coherente, al tratarse de una inicialización sin entrenar.
- Razonamiento, matemáticas o código: no disponible.
- Visión, audio u otras modalidades: la arquitectura Perceiver está diseñada para ser agnóstica al tipo de entrada y permite fusión multimodal vía fusión Tucker, pero no se documenta ningún conjunto de datos ni evaluación que lo demuestre.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidad especial destacable: el repositorio incluye `finetune.py` como punto de entrada ejecutable y un ejemplo de prueba de humo en su bloque `__main__`; al ser una implementación propia, las APIs genéricas de carga automática requieren un adaptador explícito.

## Casos de uso

- Plantilla de investigación para arquitecturas Perceiver: el repositorio permite partir de una configuración concreta (consultas agrupadas, fusión Tucker, ScaleNorm) y modificarla de forma controlada antes de invertir recursos en un entrenamiento completo.
- Pruebas de humo de pipelines de entrenamiento: `model.safetensors` actúa como inicialización válida para verificar que el script `finetune.py` carga pesos, ejecuta un paso hacia delante y guarda checkpoint sin errores.
- Banco de comparación de recetas de optimización: la inclusión de `training_args.json` con NovoGrad y schedule step facilita comparar variantes de optimizador manteniendo fija la arquitectura.
- Experimentos de fusión multimodal: el esquema de fusión Tucker y la naturaleza agnóstica al input del Perceiver permiten ensayar la combinación de dos o más modalidades en un mismo espacio latente.
- Estudio de objetivos contrastivos: al declararse como base "para Contrastive", sirve para prototipar funciones de pérdida contrastivas sobre representaciones latentes de tamaño fijo.
- Docencia y formación: el tamaño reducido del checkpoint (24.832 parámetros) y la presencia de todos los ficheros de configuración lo hacen adecuado para explicar el funcionamiento interno de un Perceiver sin necesidad de hardware especializado.
- Integración en CI de investigación: al no requerir GPU y ser un artefacto de 0,0 GB, puede ejecutarse en cualquier runner para validar cambios en el código del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente que no se reclama ninguna puntuación de benchmark y que el checkpoint no ha sido entrenado.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 24.832 parámetros el modelo cabe holgadamente en cualquier dispositivo, incluida CPU.
- GPU recomendadas: no se requiere GPU. Cualquier GPU consumer (por ejemplo, GTX 1050 o superior) sirve, y también es viable en CPU.
- Cabe en GPU consumer: sí, en cualquier modelo actual e incluso en hardware muy antiguo.
- Opciones de despliegue: no disponibles para vLLM, llama.cpp, Ollama o TGI, ya que no se publican pesos en GGUF ni adaptadores para esas herramientas. Al ser una implementación propia, el despliegue pasa por ejecutar el `finetune.py` del repositorio o escribir un adaptador explícito.
- Latencia y throughput estimados: no disponibles; no se publican mediciones y el checkpoint no está entrenado, por lo que cualquier cifra carecería de sentido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas en la informacion proporcionada. La referencia conceptual más cercana es Perceiver IO de DeepMind, pero no se incluyen en esta ficha sus parámetros, contexto, licencia ni resultados, por lo que no se puede establecer una comparación cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| HarryJohnson/perceiver-baseline | 24.832 | no disponible | BSD-3-Clause | Checkpoint de inicializacion, sin entrenar |
| Perceiver IO (DeepMind) | no disponible | no disponible | no disponible | Referencia conceptual; datos no incluidos en la informacion proporcionada |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El checkpoint no está entrenado: no ha superado ninguna fase de entrenamiento, por lo que no produce salidas útiles y no debe emplearse para inferencia real.
- No ha sido auditado en robustez, equidad ni transferencia de dominio, según reconoce el propio autor.
- Riesgo de alucinación: no evaluable, dado que el modelo no genera texto de forma funcional.
- Idiomas: no se declara ningún idioma soportado.
- Contexto: la longitud de contexto no está documentada; no se puede asumir ninguna ventana concreta.
- Licencia BSD-3-Clause: permite uso comercial y modificación con atribución, pero los términos de los datos externos que se usen con este repositorio deben revisarse por separado.
- El tamaño real (24.832 parámetros) contradice la etiqueta "giant" de la configuración; conviene no confundir la escala nominal declarada con la capacidad efectiva.
- No hay puntuaciones de benchmark y el autor advierte de que cualquier resultado futuro debe documentarse por separado de los valores por defecto aquí incluidos.
- Las APIs genéricas de carga automática de transformers no funcionan sin un adaptador explícito, al tratarse de una implementación propia.
- El repositorio tiene 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/HarryJohnson/perceiver-baseline
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes al modelo (corresponden a páginas de soporte de YouTube), por lo que no se incluyen enlaces adicionales.

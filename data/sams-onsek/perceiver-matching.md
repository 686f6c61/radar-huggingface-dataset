# sams-onsek/perceiver-matching

## Resumen

`sams-onsek/perceiver-matching` es un repositorio experimental publicado por el usuario sams-onsek que implementa una arquitectura Perceiver orientada a tareas de *matching* (emparejamiento). No se trata de un modelo entrenado, sino de una base de código y un *checkpoint* de inicialización pensado para iterar sobre cambios de arquitectura antes de lanzar un entrenamiento completo. El autor indica explícitamente que el fichero `model.safetensors` es válido para *smoke tests*, pero no constituye un checkpoint con rendimiento demostrado.

El repositorio incluye el código en Python (`finetune.py`), un `config.json` con los ajustes de arquitectura, un `training_args.json` con la receta de experimento por defecto y el citado checkpoint. La arquitectura declarada combina atención de ventana deslizante (*sliding window*) con fusión mediante *co-attention*, activación ReLU y normalización por *batchnorm*. El autor etiqueta la escala como «xlarge», pero el recuento real de parámetros del checkpoint es de solo 16.576, una cifra muy alejada de lo que suele asociarse a esa etiqueta.

El interés actual del repositorio es limitado y de carácter metodológico: sirve como andamiaje reproducible para investigar arquitecturas Perceiver aplicadas a emparejamiento, no como un modelo desplegable. No se declara ningún resultado de *benchmark*, no se documentan idiomas soportados y las descargas y *likes* son cero en el momento de la consulta. La licencia es MIT, lo que facilita su reutilización para experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceiver |
| Parametros totales | 16.576 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

Datos adicionales declarados en la *model card*: escala etiquetada como «xlarge», atención de ventana deslizante, fusión por *co-attention*, activación ReLU, normalización *batchnorm*, optimizador LAMB y esquema de *linear warmup*.

## Arquitectura y entrenamiento

Se trata de una implementación Perceiver personalizada, no de un modelo derivado de una librería estándar. La arquitectura declarada usa atención de ventana deslizante y fusión por *co-attention*, con activación ReLU y normalización por lotes (*batchnorm*) en lugar de las alternativas más comunes en transformadores modernos (*layernorm* y activaciones tipo GELU/SiLU). El autor señala que el diseño de escala «xlarge» se ha mantenido deliberadamente manejable para poder inspeccionar cambios arquitectónicos antes de ejecutar un entrenamiento completo.

No hay evidencia de que se haya completado un entrenamiento. La receta por defecto del repositorio usa el optimizador LAMB con un calendario de *warmup* lineal, pero el propio autor aclara que esos son valores de partida del script y no prueba de una ejecución finalizada. No se especifican el número de tokens de entrenamiento, la composición del *dataset*, ni si hubo fases de RLHF, DPO u otro ajuste por preferencias. El checkpoint incluido se describe como inicialización para *smoke tests*, sin auditoría de robustez, equidad ni transferencia de dominio.

## Capacidades

- No se declara ninguna capacidad funcional verificada. El modelo no ha sido entrenado.
- El repositorio proporciona código ejecutable de ejemplo y un punto de entrada de *fine-tuning* (`finetune.py`), útil como *scaffold* de investigación.
- Arquitectura orientada conceptualmente a tareas de *matching* (emparejamiento entre dos conjuntos de entradas) mediante *co-attention*.
- No hay soporte documentado de *tool calling* ni de *function calling*.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No se documentan capacidades multilingües.
- No se declaran modos especiales como *thinking mode*, visión o audio.

## Casos de uso

Todos los casos siguientes son hipotéticos y exigen entrenar previamente el modelo; el checkpoint publicado no es utilizable tal cual.

- Investigación en arquitecturas Perceiver: el repositorio permite modificar el *config* y lanzar ejecuciones controladas para estudiar el efecto de la atención de ventana deslizante o la fusión por *co-attention* frente a alternativas, sin la sobrecarga de un modelo a gran escala.
- Emparejamiento de documentos (por ejemplo, correspondencia entre reclamaciones y resoluciones): el diseño de *co-attention* es adecuado para modelar interacciones entre dos secuencias, aunque requiere entrenamiento supervisado con pares etiquetados.
- Resolución de entidades ( *entity resolution* ) en bases de datos: comparar registros de dos fuentes y decidir si se refieren a la misma entidad, aprovechando la fusión de representaciones.
- *Reranking* en recuperación de información: puntuar pares consulta-documento una vez entrenado con datos de relevancia, como etapa posterior a un recuperador léxico o denso.
- Detección de duplicados en catálogos o corpus: emparejamiento par a par para marcar contenidos redundantes.
- Emparejamiento multimodal, si se extiende el codificador de entrada: el esquema Perceiver admite distintas modalidades mediante *cross-attention*, aunque el repositorio no incluye esa implementación.
- Prototipado y docencia: servir como ejemplo mínimo y ejecutable de una arquitectura Perceiver para experimentos académicos o pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que no se reclama ninguna puntuación de *benchmark* en el repositorio y que el checkpoint es una inicialización sin entrenar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB. Con 16.576 parámetros, en fp32 ocupa aproximadamente 0,06 MB y en fp16 alrededor de 0,03 MB, por lo que la memoria del modelo es irrelevante frente al coste del resto del *pipeline*.
- GPU recomendadas: cualquiera, incluida una GPU integrada. No se requiere A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU.
- Opciones de despliegue: el propio autor advierte que, al ser una implementación personalizada, las APIs genéricas de carga automática requieren un adaptador explícito. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no aporta datos de rendimiento ni comparaciones con otras implementaciones, y no hay cifras verificables que permitan contrastarlo con Perceiver IO u otras arquitecturas de emparejamiento. Cualquier comparación cuantitativa sería especulativa.

## Limitaciones y advertencias

- El checkpoint no ha sido entrenado; no debe usarse para inferencia con expectativas de calidad.
- No se ha auditado robustez, equidad ni sesgos, según reconoce el propio autor.
- No hay resultados de *benchmark* ni métricas de evaluación publicadas.
- La etiqueta de escala «xlarge» no concuerda con los 16.576 parámetros reales del checkpoint; conviene no interpretarla como indicación de capacidad.
- No se documenta la longitud de contexto ni los idiomas soportados.
- No se declaran opciones de cuantización ni formatos de despliegue estándar.
- La licencia MIT permite uso comercial del código, pero el autor recomienda revisar por separado los términos de los datos de origen si se emplean *datasets* externos.
- Al ser una implementación personalizada, requiere un adaptador explícito para cargarse con APIs genéricas; esto complica su integración en *frameworks* estándar.
- La fecha de creación del repositorio aparece como 2026-10-13, posterior a la fecha habitual de consulta; conviene verificar la vigencia de los metadatos.

## Enlaces

- HuggingFace: https://huggingface.co/sams-onsek/perceiver-matching
- No se han encontrado en la busqueda web enlaces relevantes (papers, blogs, repositorios o demos) asociados a este modelo.

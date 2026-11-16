# arbora-anon/arbora-qwen3-8b-experts-v2

## Resumen

Arbora Qwen3-8B experts v2 es un modelo borrador (drafter) para decodificacion especulativa construido sobre el drafter congelado Qwen3-8B-DFlash-b16 de z-lab. Lo desarrolla el equipo del proyecto Arbora (autoria anonima, en revision) y forma parte de la publicacion de codigo del articulo "Arbora: Making Better Use of the Draft Tokens from Block Diffusion Drafters". Su funcion no es generar texto de forma autonoma, sino proponer tokens candidatos que un modelo objetivo Qwen3-8B verifica despues, acelerando la inferencia sin alterar la distribucion de salida del modelo grande.

La innovacion principal reside en sustituir el selector de caminos original por un *path scorer* y en anadir ocho expertos Arbora por capa, implementados como MLPs de un octavo de ancho. El checkpoint corresponde al paso 2.000 de entrenamiento del drafter y es el fichero que carga la fila "arbora" del banco de pruebas del proyecto.

Con 1.924.711.720 parametros reales en safetensors y un repositorio de 3,8 GB, es un modelo de escala media pensado para ejecutarse junto al modelo objetivo en el mismo nodo. La licencia Apache 2.0 y su naturaleza de componente de aceleracion lo hacen relevante para equipos que ya sirven Qwen3-8B y quieren reducir la latencia de decodificacion sin reentrenar el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen3 (drafter de decodificacion especulativa), con ocho expertos Arbora por capa (MLPs de un octavo de ancho) y path scorer en lugar de path selector |
| Parametros totales | 1.924.711.720 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | z-lab/Qwen3-8B-DFlash-b16 (finetune) |
| Paso de entrenamiento | 2.000 |
| Tamano del repositorio | 3,8 GB |

## Arquitectura y entrenamiento

El modelo es un drafter de decodificacion especulativa derivado del Qwen3-8B-DFlash-b16 de z-lab, que se mantiene congelado. Sobre esa base se anaden ocho expertos Arbora por capa, cada uno con un MLP de un octavo de ancho, y se incorpora un *path scorer* que reemplaza al *path selector* original del drafter. Esta combinacion busca aprovechar mejor los tokens borrador que produce un drafter de difusion por bloques, tal como describe el articulo del proyecto.

El entrenamiento se realizo sobre las respuestas del propio modelo objetivo a una coleccion de prompts que no se ha publicado. El paso publicado corresponde al checkpoint 2.000. El repositorio de codigo asociado describe la receta y los scripts necesarios para reconstruir los datos de entrenamiento a partir de cualquier fichero de prompts, lo que permite reproducir el procedimiento con un corpus propio. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa sobre un modelo objetivo Qwen3-8B.
- Aceleracion de inferencia mediante verificacion de candidatos por el modelo grande, manteniendo la distribucion de salida del objetivo.
- Aprovechamiento de tokens borrador procedentes de un drafter de difusion por bloques (DFlash2).
- Seleccion de caminos mediante *path scorer*, orientada a mejorar la tasa de aceptacion de tokens propuestos.
- Integracion con el stack de serving del proyecto Arbora (`arbora/serving/serve.sh`).
- No es un modelo de proposito general: no se documentan capacidades de razonamiento, codigo, matematicas, vision, tool calling, agentes ni multilingues por si mismo.

## Casos de uso

- Aceleracion de un endpoint de Qwen3-8B en produccion: desplegar el drafter junto al modelo objetivo para reducir la latencia por token generado en cargas de decodificacion autoregresiva, siempre que la tasa de aceptacion del borrador sea alta.
- Servicio de chat de baja latencia: usar la decodificacion especulativa para disminuir el tiempo hasta el primer token completo en conversaciones multi-turno, manteniendo la calidad del modelo objetivo intacta.
- Generacion de codigo interactiva: integrar el drafter en un asistente de autocompletado donde la latencia percibida es critica y el modelo objetivo Qwen3-8B ya esta validado.
- Investigacion en decodificacion especulativa: emplear el checkpoint como referencia reproducible del paso 2.000 para comparar el *path scorer* frente al *path selector* original del drafter DFlash.
- Reentrenamiento con corpus propio: usar los scripts del repositorio de codigo para reconstruir los datos de entrenamiento a partir de un fichero de prompts propio y adaptar el drafter al dominio de la aplicacion.
- Evaluacion de pipelines de serving: medir el impacto del drafter en throughput y latencia dentro de un banco de pruebas con el modelo objetivo, comparando configuraciones de expertos y scorer.
- Despliegue en infraestructura con GPU de memoria media: al ocupar 3,8 GB en safetensors, el drafter puede convivir con el modelo objetivo en el mismo nodo sin agotar la memoria de la GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,8 GB en precision nativa segun el tamano del repositorio; no se dispone de cifras para cuantizaciones alternativas.
- El drafter debe ejecutarse junto al modelo objetivo Qwen3-8B, por lo que la VRAM total del despliegue incluye la del modelo grande mas la del borrador.
- GPU recomendadas: no disponible de forma especifica; por el perfil de memoria, cabe en GPU de consumo con suficiente VRAM libre tras cargar el modelo objetivo.
- Opciones de despliegue: el stack propio del proyecto Arbora (`arbora/serving/serve.sh`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Arbora Qwen3-8B experts v2 | 1.924.711.720 | no disponible | Drafter especulativo con expertos Arbora y path scorer | Apache 2.0 | Hugging Face (repo del autor) |
| z-lab/Qwen3-8B-DFlash-b16 | no disponible | no disponible | Drafter de difusion por bloques (modelo base) | no disponible | Hugging Face |
| Qwen3-8B | 8B (aproximado, segun familia Qwen3) | no disponible | Modelo objetivo de proposito general | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de proposito general: solo tiene sentido como drafter acoplado a un modelo objetivo compatible; no debe usarse para generar respuestas finales.
- La calidad de la aceleracion depende de la tasa de aceptacion de tokens, que no se documenta en la informacion disponible.
- El checkpoint corresponde al paso 2.000; no se indica si es el punto optimo de entrenamiento ni como se comporta en pasos posteriores.
- La coleccion de prompts de entrenamiento no se ha publicado, lo que limita la reproducibilidad exacta del checkpoint.
- No se documentan sesgos conocidos, riesgo de alucinacion ni limitaciones de idioma del drafter.
- El modelo esta en revision anonima; el articulo y el repositorio de codigo pueden cambiar antes de la publicacion final.
- Aunque la licencia es Apache 2.0, deben revisarse los avisos de terceros en el fichero `NOTICE` antes de un uso comercial.
- No se documentan cuantizaciones soportadas ni compatibilidad con frameworks de serving estandar, lo que puede complicar el despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arbora-anon/arbora-qwen3-8b-experts-v2
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Codigo e instrucciones del proyecto: https://anonymous.4open.science/r/arbora-7ABE

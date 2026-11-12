# ozyman/sidebar-test-hub

## Resumen

`ozyman/sidebar-test-hub` es un repositorio alojado en Hugging Face que no constituye un modelo funcional. Segun su propia model card, se trata de una prueba de maquetacion ("layout test") para el issue #500 de la plataforma, con pesos ficticios ("Dummy weights; do not use") y anuncio explicito de que sera eliminado. El repositorio declara como modelo base `Qwen/Qwen3.5-9B`, del que seria una cuantizacion en formato MLX, pero no contiene pesos reales descargables.

El interes tecnico del repositorio es nulo desde el punto de vista de la inferencia, aunque sirve como referencia del formato de cuantizacion KQuant aplicado a un modelo de 9.000 millones de parametros y de la estructura de tarjetas de modelo con tabla de variantes. La model card incluye dos enlaces a repositorios hermanos (`sidebar-test-q4` y `sidebar-test-q5`) con tamanos de descarga y metricas de divergencia KL frente a BF16, pero estos datos corresponden a una prueba de interfaz, no a un artefacto validado.

Por tanto, esta ficha documenta lo que el repositorio declara y advierte de que no debe utilizarse en produccion ni en evaluacion. Cualquier dato de arquitectura, entrenamiento o rendimiento del modelo subyacente Qwen3.5-9B no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda de Qwen/Qwen3.5-9B; no detallada) |
| Parametros totales | 9B (segun el identificador del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | KQuant 4-bit y 5-bit (variantes q4 y q5 referenciadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (libreria `mlx`); pesos ficticios, no descargables en este repositorio |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base `Qwen/Qwen3.5-9B` en la documentacion proporcionada: ni tipo de transformer, ni composicion del dataset, ni fases de alineacion (RLHF, DPO) ni numero de tokens de entrenamiento. El repositorio unicamente declara la relacion `base_model_relation: quantized`, es decir, que se presenta como una version cuantizada de dicho modelo base mediante la tecnica KQuant en formato MLX.

La unica informacion tecnica concreta son las metricas de la tabla de variantes: la version de 4 bits ocupa 6,2 GB y presenta una divergencia KL frente a BF16 de 0,030, mientras que la de 5 bits ocupa 7,1 GB con una KL de 0,010. Ambas se declaran compatibles con equipos de 16 GB o mas. No obstante, al tratarse de pesos ficticios, estas cifras deben interpretarse como datos de ejemplo para la prueba de interfaz y no como resultados medidos sobre un artefacto real.

## Capacidades

- No se puede atribuir ninguna capacidad funcional al repositorio: la model card indica explicitamente "Dummy weights; do not use".
- El pipeline declarado es `image-text-to-text`, lo que sugiere un modelo multimodal de entrada imagen y texto, pero no se detalla el soporte real de vision.
- No hay informacion sobre tool calling, function calling, razonamiento multi-paso ni modo de pensamiento.
- No hay informacion sobre capacidades multilingues ni sobre idiomas soportados.
- No hay informacion sobre generacion de codigo, matematicas o agentes.

## Casos de uso

- Pruebas de maquetacion de la plataforma Hugging Face: el repositorio existe para validar el diseno de tarjetas de modelo sin pesos (issue #500), no para inferencia.
- Validacion de herramientas internas de catalogo: permite comprobar como se renderizan tablas de variantes de cuantizacion y enlaces a repositorios hermanos.
- Referencia de esquema para publicadores: sirve como plantilla de estructura de model card con tabla de bits, tamano de descarga, KL y requisitos de memoria.
- Documentacion de formatos KQuant en MLX: los enlaces a `sidebar-test-q4` y `sidebar-test-q5` ilustran la nomenclatura `9b:kquant` y `9b:kquant5`.
- Formacion sobre cuantizacion: util para explicar la relacion entre bits, tamano en disco y divergencia KL en un contexto controlado.
- No es adecuado para atencion al cliente, generacion de codigo, agentes, analisis de documentos ni ninguna tarea de produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica presente es la divergencia KL frente a BF16 de las variantes referenciadas, que se reproduce a continuacion a modo de dato declarado en la model card:

| Variante | Bits | Tamano | KL a BF16 | Memoria minima |
|---|---|---|---|---|
| sidebar-test-q4 | 4 | 6,2 GB | 0,030 | 16 GB+ |
| sidebar-test-q5 | 5 | 7,1 GB | 0,010 | 16 GB+ |

Estos valores corresponden a una prueba de interfaz y no deben citarse como rendimiento validado del modelo.

## Requisitos de hardware

- VRAM estimada: segun la model card, ambas variantes requieren 16 GB o mas de memoria unificada o VRAM.
- GPU recomendadas: no disponibles; el formato MLX esta orientado a Apple Silicon (memoria unificada), aunque no se especifica en la informacion.
- Compatibilidad con GPU de consumo: el requisito de 16 GB+ encaja con equipos Apple Silicon de gama alta, pero no se detalla ningun modelo concreto.
- Opciones de despliegue: MLX (libreria declarada); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no contiene pesos funcionales y la informacion proporcionada no incluye datos de modelos comparables de la misma categoria (multimodales de 9B cuantizados en MLX).

## Limitaciones y advertencias

- El repositorio contiene pesos ficticios y su autor indica explicitamente que no debe usarse ("Dummy weights; do not use. Will be deleted.").
- El repositorio sera eliminado, por lo que no es una dependencia estable para ningun proyecto.
- No se han publicado datos de sesgos, alucinacion ni evaluaciones de seguridad.
- No hay informacion sobre limites de contexto o cobertura idiomatica.
- La licencia Apache 2.0 se declara en la model card, pero al no existir artefacto real no puede verificarse su aplicabilidad.
- Cualquier integracion en produccion basada en este repositorio seria un error; debe usarse el modelo base `Qwen/Qwen3.5-9B` o una cuantizacion validada del mismo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ozyman/sidebar-test-hub
- Variante 4-bit referenciada: https://huggingface.co/ozyman/sidebar-test-q4
- Variante 5-bit referenciada: https://huggingface.co/ozyman/sidebar-test-q5
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-9B

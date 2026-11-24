# AL-NPL/Ishu4-Qwen3.54B-Split16k-AO-F-FA-FB-O-Cropped_512_512_Epoch1

## Resumen

Ishu 4 es un adaptador LoRA de tipo SFT (supervised fine-tuning) construido sobre el modelo base `unsloth/Qwen3.5-4B`, desarrollado por Autolab (AL-NPL). Su proposito es convertir dibujos tecnicos 2D en proyeccion ortografica en codigo Python parametrico ejecutable mediante CadQuery y el kernel de geometria OpenCASCADE. Es, por tanto, un modelo vision-lenguaje especializado en un dominio de ingenieria muy concreto, no un modelo de proposito general.

El repositorio contiene unicamente los pesos del adaptador (0,1 GB), no el modelo base completo, de modo que su uso requiere descargar `unsloth/Qwen3.5-4B` y aplicar el adaptador con PEFT. La model card indica que fue seleccionado como modelo insignia de la serie Ishu-4 tras un estudio empirico comparativo, y reporta metricas internas de validacion geometrica sobre su propio split de test.

La relevancia del modelo reside en su nicho: automatizar el paso de plano tecnico a solido 3D parametrico, una tarea donde los modelos generalistas fallan con frecuencia por la estricta sintaxis de CadQuery y por la necesidad de coherencia geometrica (aristas, cotas, alineacion de contornos). La informacion publica disponible es escasa fuera de la propia model card y no incluye detalles sobre composicion del dataset ni regimen de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only `unsloth/Qwen3.5-4B`; adaptador con r=16, alpha=32 |
| Parametros totales | no disponible (adaptador de 0,1 GB; el modelo base Qwen3.5-4B no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base; no declarada en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos del adaptador en safetensors; la cuantizacion depende del base y del runtime) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el base en su formato original |
| Modelo base | unsloth/Qwen3.5-4B |
| Libreria | peft (compatible con transformers, trl, unsloth) |
| Pipeline | text-generation (con entrada de imagen, vision-language) |
| Dataset de entrenamiento | AL-NPL/Split16k_AO-FP-F-FA-FB-O1_3pairx_PartSplit_TTV80-10-10_20261009_0335pm |
| Preprocesado de imagen | recorte al bounding box de tinta activa y escalado a lienzo cuadrado de 512x512 con relleno blanco |
| Generacion maxima | 4096 tokens |
| Temperatura recomendada | 0,1 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 entrenado mediante SFT sobre `unsloth/Qwen3.5-4B`, un transformer decoder-only multimodal de 4B parametros. El entrenamiento se realizo con el stack Unsloth/TRL, segun las etiquetas del repositorio. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; la unica referencia es el identificador del dataset, que sugiere un split de train/validacion/test en proporcion 80/10/10 y un esquema de particion por pares y por piezas ("PartSplit", "3pairx").

La innovacion tecnica documentada es de preprocesado mas que de arquitectura: el recorte al bounding box de la tinta activa y el reescalado a un lienzo cuadrado de 512x512 reducen el coste en tokens de entrada un 58,8% (hasta 327,4 tokens de media), lo que segun la model card es condicion necesaria para alcanzar las metricas reportadas. El prompt de inferencia recomendado fija temperatura 0,1 y un maximo de 4096 tokens de generacion, coherente con la salida de codigo CadQuery completo. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento extendido.

## Capacidades

- Traduccion de dibujos tecnicos 2D en proyeccion ortografica a codigo Python parametrico con CadQuery y OpenCASCADE.
- Generacion de codigo ejecutable que produce solidos 3D con operaciones booleanas.
- Razonamiento geometrico implicito: alineacion de lineas de contorno, interpretacion de cotas y reconstruccion de features B-Rep.
- Procesamiento de entrada vision-lenguaje (imagen del plano mas instrucciones textuales).
- Generacion de texto conversacional heredada del modelo base Qwen3.5-4B.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles; la model card esta redactada en ingles.
- Capacidades especiales documentadas: ninguna adicional (sin modo thinking, audio ni vision generalista declarada).

## Casos de uso

- Digitalizacion de planos de taller: introducir un plano ortografico escaneado y obtener un script CadQuery que reconstruya la pieza, reduciendo el trabajo manual de remodelado en CAD.
- Generacion de bibliotecas parametricas: producir scripts reutilizables con parametros editables para familias de piezas (bridas, soportes, placas) a partir de planos existentes.
- Verificacion geometrica automatizada: generar el solido y comparar su IoU de silueta multivista contra el plano original como control de calidad en un pipeline de ingenieria.
- Prototipado rapido en impresion 3D: convertir un croquis acotado en un modelo solido exportable a STL mediante CadQuery antes de imprimir.
- Migracion de archivos CAD propietarios: reconstruir geometria como codigo abierto y versionable (CadQuery/OpenCASCADE) a partir de planos impresos, evitando dependencias de formatos cerrados.
- Docencia de CAD programatico: usar el modelo como generador de ejemplos ejecutables que ilustren operaciones booleanas y restricciones geometricas a partir de dibujos de ejercicios.
- Integracion en herramientas de ingenieria interna: exponer el adaptador como servicio de generacion de codigo CAD detras de una API, con preprocesado de imagen fijo (recorte de tinta y lienzo 512x512) para reproducir las condiciones de benchmark.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card sobre su split de test in-distribution (100 muestras):

| Metrica | Valor |
|---|---|
| Tasa de compilacion en kernel OpenCASCADE | 97,0% (97/100) |
| Puntuacion CAD compuesta ({CAD}$) | 88,15 / 100 |
| IoU medio de solido booleano 3D | 0,8641 |
| IoU mediano de solido booleano 3D | 0,9684 |
| IoU de silueta multivista (14 vistas) | 0,8666 |
| IoU de aristas de feature B-Rep | 0,6800 |
| IoU de superficie (surrogate) | 0,9420 |
| Alineacion de normales de superficie | 0,9111 |
| Eficiencia de tokens de entrada | 327,4 tokens (reduccion del 58,8% por recorte de tinta) |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. Las cifras proceden exclusivamente del autor y corresponden a un split in-distribution, por lo que no deben interpretarse como rendimiento fuera de distribucion.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un transformer de 4B en FP16 requiere del orden de 8-9 GB solo para pesos, mas overhead de activaciones y cache KV; en cuantizacion de 4 bits el peso baja a unos 2,5-3 GB. Estas cifras son estimaciones generales, no datos publicados del modelo.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del base, una RTX 4090 (24 GB) o una A100/H100 son opciones sobredimensionadas pero seguras para FP16 con contexto largo.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del base (4B), en tarjetas de 8 GB o mas con cuantizacion; no confirmado por el autor.
- Opciones de despliegue: transformers + peft (ruta documentada por las etiquetas), trl y unsloth para entrenamiento e inferencia. vLLM, llama.cpp, Ollama y TGI no estan documentados para este adaptador; su uso requeriria fusionar el LoRA con el base y convertir a GGUF u otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables en la informacion proporcionada. Como referencia estructural:

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ishu 4 (este modelo) | adaptador sobre base 4B | no disponible | CAD 2D a CadQuery | no disponible | Hugging Face, 0 descargas |
| Modelos CAD-VLM alternativos | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-4B (base) | 4B | no disponible | proposito general multimodal | no disponible | Hugging Face (unsloth) |

No se han identificado en la informacion disponible alternativas especializadas equivalentes con metricas publicadas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Entrenado y evaluado sobre un unico dataset con split in-distribution: las metricas del 97% de compilacion y 0,86 de IoU no garantizan generalizacion a planos de otras fuentes, estilos de dibujo o convenciones de acotado.
- El IoU de aristas de feature B-Rep (0,68) es notablemente inferior al de superficie (0,94), lo que indica que la reconstruccion topologica fina (aristas, chaflanes, detalles) es el punto debil.
- El rendimiento depende criticamente del preprocesado: sin el recorte al bounding box de tinta y el lienzo 512x512, la model card no garantiza los resultados reportados.
- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible verificar la licencia del adaptador y la del base `unsloth/Qwen3.5-4B` antes de cualquier despliegue en produccion.
- Riesgo de alucinacion geometrica: el modelo puede generar codigo CadQuery sintacticamente valido pero geometricamente incorrecto; el 3% de fallos de compilacion reportado implica que hace falta validacion en el kernel antes de usar la salida.
- Idiomas no declarados: la model card esta en ingles y no se especifica soporte de castellano ni de otros idiomas.
- Sin datos de sesgos, contexto maximo efectivo, throughput ni latencia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion independiente por parte de la comunidad.
- El repositorio no incluye el modelo base; el adaptador por si solo no es desplegable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AL-NPL/Ishu4-Qwen3.54B-Split16k-AO-F-FA-FB-O-Cropped_512_512_Epoch1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/AL-NPL/Split16k_AO-FP-F-FA-FB-O1_3pairx_PartSplit_TTV80-10-10_20261009_0335pm
- Perfil del autor: https://huggingface.co/AL-NPL
- CadQuery: https://cadquery.readthedocs.io/
- OpenCASCADE: https://dev.opencascade.org/
- PEFT: https://github.com/huggingface/peft
- Unsloth: https://github.com/unslothai/unsloth

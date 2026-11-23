# quaisse/text2cad-qlora-adapter

## Resumen

`quaisse/text2cad-qlora-adapter` es un adaptador LoRA entrenado con QLoRA sobre el modelo base `Qwen/Qwen2.5-Coder-7B-Instruct`. Su funcion es convertir descripciones en lenguaje natural de piezas mecanicas en codigo Python ejecutable que utiliza la libreria CadQuery, un framework de CAD parametrico basado en scripts. El adaptador no es un modelo autonomo: requiere cargar el modelo base Qwen2.5-Coder-7B-Instruct y superponer los pesos LoRA mediante la libreria PEFT.

El problema que aborda es la traduccion de especificaciones textuales de diseno mecanico a geometria parametrica reproducible. En lugar de generar formatos binarios CAD o STEP, el modelo produce codigo CadQuery, lo que permite versionar, revisar y modificar la geometria como cualquier otro artefacto de software. Esto encaja con flujos de ingenieria que ya trabajan con control de versiones y pipelines automatizados.

El adaptador tiene un tamano de repositorio de aproximadamente 0,3 GB, coherente con un adaptador LoRA de rango 32 sobre un modelo de 7B parametros. La model card es escueta y no documenta resultados de benchmarks, composicion exacta del dataset ni metricas de evaluacion. La licencia declarada es Apache 2.0, tanto para el adaptador como para el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (QLoRA) sobre transformer decoder-only (Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en el adaptador; heredada del modelo base Qwen2.5-Coder-7B-Instruct |
| Tipos de cuantizacion | Entrenamiento en 4-bit NF4; el adaptador se distribuye en safetensors; cuantizacion de inferencia no especificada |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5-Coder soporta multiples idiomas, pero la model card no lo detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | r=32, alpha=64, dropout=0.05 |
| Modulos objetivo | q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj, down_proj |
| Modelo base | Qwen/Qwen2.5-Coder-7B-Instruct |
| Libreria | PEFT |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA, es decir, el modelo base se cuantiza a 4-bit NF4 durante el entrenamiento y solo se actualizan los pesos de bajo rango inyectados en las proyecciones de atencion y de la MLP. Los modulos objetivo cubren las proyecciones de query, key, value, output, gate, up y down, lo que corresponde a una adaptacion completa de los bloques transformer del modelo base. El rango es 32 con alpha 64 y dropout 0,05, una configuracion relativamente agresiva en capacidad de adaptacion para un adaptador de este tamano.

El dataset de entrenamiento se describe unicamente como "text2cad dataset" con pares descripcion -> programa CadQuery. No se especifica el numero de ejemplos, la procedencia de las descripciones, si hubo filtrado de codigo invalido, ni si se aplico validacion geometrica de las piezas generadas. El prompt de sistema es fijo: "You are an expert in parametric CAD...", seguido de la descripcion del usuario. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, RLHF, DPO ni attention linear); el mecanismo es un fine-tuning supervisado estandar sobre instrucciones.

## Capacidades

- Generacion de codigo Python con CadQuery (`import cadquery as cq`) a partir de descripciones textuales de piezas mecanicas.
- Interpretacion de especificaciones dimensionales explicitas (por ejemplo, "una placa de 80x50x6 mm con un agujero de 10 mm en cada esquina").
- Produccion de codigo parametrico, lo que permite modificar dimensiones y regenerar geometria sin reescribir el programa.
- Salida restringida a codigo ejecutable: el prompt de sistema instruye al modelo a devolver solo codigo Python.
- Soporte de conversacion multi-turno mediante la plantilla de chat del modelo base Qwen2.5-Coder-7B-Instruct.
- No incluye tool calling, function calling, capacidades de agente, vision, audio ni modo de razonamiento explicito documentados en la model card.
- Capacidades multilingues no documentadas; el prompt de sistema esta en ingles.

## Casos de uso

- Generacion de prototipos CAD desde especificaciones textuales: un ingeniero describe una pieza (dimensiones, taladros, chaflanes) y obtiene un programa CadQuery ejecutable que puede abrir en CQ-editor o exportar a STEP/STL.
- Automatizacion de bibliotecas de componentes: generar variantes parametricas de piezas estandar (placas, bridas, soportes) cambiando solo los parametros de entrada, reduciendo el trabajo manual de modelado.
- Integracion en pipelines de CI para validacion geometrica: el codigo generado puede ejecutarse en un entorno con CadQuery instalado para comprobar que la pieza se construye sin errores antes de aprobar un cambio.
- Documentacion tecnica reproducible: convertir descripciones de piezas recogidas en especificaciones o tickets en scripts CAD versionados junto al resto del codigo del proyecto.
- Asistencia a disenadores no programadores: traducir requerimientos expresados en lenguaje natural a codigo CadQuery que luego un ingeniero revisa y ajusta.
- Educacion y formacion en CAD parametrico: usar las salidas como punto de partida para ensenar construccion de geometria mediante scripts, comparando el codigo generado con el modelado manual.
- Generacion de datasets sinteticos CAD: producir pares descripcion-codigo para ampliar corpus de entrenamiento o para pruebas de herramientas de analisis geometrico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exactitud de codigo, tasa de ejecucion correcta, validacion geometrica (volumen, numero de caras, tolerancias) ni comparaciones con otros adaptadores o modelos text-to-CAD.

## Requisitos de hardware

- El adaptador en si ocupa aproximadamente 0,3 GB; el requisito real lo determina el modelo base Qwen2.5-Coder-7B-Instruct.
- Inferencia en bfloat16 del modelo base: se estima en torno a 14-16 GB de VRAM, suficiente para una RTX 4090 (24 GB) o una A100 de 40 GB.
- Inferencia con cuantizacion de 4 bits del modelo base: se estima en torno a 5-7 GB de VRAM, lo que permite ejecucion en GPUs consumer como RTX 3060 12 GB, RTX 4070 o RTX 4090.
- El adaptador PEFT se carga sobre el modelo base; no es compatible directamente con llama.cpp u Ollama sin fusion previa de los pesos LoRA en el modelo base.
- Opciones de despliegue: transformers + peft (metodo documentado en la model card), vLLM o TGI tras fusionar el adaptador con el modelo base.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quaisse/text2cad-qlora-adapter | Adaptador LoRA sobre 7B | Heredado del base (no disponible) | Texto a codigo CadQuery | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-7B-Instruct | 7B | No disponible en esta ficha | Codigo general | Apache 2.0 | Hugging Face |
| Alternativas text-to-CAD especializadas | No disponible | No disponible | Texto a CAD | No disponible | No disponible |

No se dispone de datos de rendimiento ni de otros adaptadores text-to-CAD comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- El modelo genera codigo que no se ejecuta ni se valida automaticamente; la model card indica explicitamente que el codigo debe ejecutarse por cuenta del usuario con CadQuery instalado.
- No hay metricas publicadas de tasa de exito de ejecucion ni de correccion geometrica, por lo que la fiabilidad real en produccion es desconocida.
- Riesgo de alucinacion de APIs CadQuery inexistentes o de parametros fuera de rango; se recomienda validacion automatica del codigo generado.
- El adaptador esta entrenado con un prompt de sistema fijo en ingles; cambiar el prompt puede degradar el comportamiento.
- No se documenta el dataset de entrenamiento (tamano, diversidad, cobertura de operaciones CAD), lo que impide evaluar sesgos o cobertura de casos.
- Capacidades multilingues no documentadas; las descripciones en castellano pueden funcionar peor que en ingles.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen2.5-Coder-7B-Instruct, tambien Apache 2.0.
- El adaptador no incluye pesos fusionados; requiere cargar el modelo base, lo que complica despliegues ligeros o en entornos sin transformers/peft.
- El repositorio muestra cero descargas y cero likes, lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/quaisse/text2cad-qlora-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Documentacion de CadQuery: https://cadquery.readthedocs.io/
- Libreria PEFT: no disponible en la informacion proporcionada (referencia habitual: https://github.com/huggingface/peft)
- Paper, blog o demo del adaptador: no disponibles en la informacion proporcionada.

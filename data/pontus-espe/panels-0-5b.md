# pontus-espe/panels-0.5b

## Resumen

Panels 0.5B es un modelo de generación de texto de 0,5 mil millones de parámetros, desarrollado por Pontus Espe, que parte del modelo base Qwen/Qwen2.5-0.5B-Instruct y se ha ajustado mediante LoRA para escribir documentos en el lenguaje declarativo Panels. Panels es un pequeño lenguaje para aplicaciones con estado, diseñado específicamente para que una gramática a nivel de caracteres pueda restringir la decodificación token a token. El modelo está pensado para ejecutarse detrás de esa gramática, de modo que no puede emitir errores de sintaxis, nombres de campos no declarados ni efectos aplicados a tipos incorrectos, porque esos tokens se eliminan de la distribución antes del argmax.

La relevancia de este modelo radica en su enfoque híbrido: la gramática garantiza la validez sintáctica y tipada, mientras que el ajuste fino se centra en lo que la gramática no puede expresar, como las convenciones del lenguaje y saber cuándo un documento está terminado. Está disponible en formato ONNX cuantizado (4 bits e int8) para ejecución en navegador mediante WebGPU o WASM, lo que permite generar aplicaciones de interfaz de usuario de forma fiable sin infraestructura de servidor. El repositorio tiene un tamaño de 1,3 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2) |
| Parametros totales | 0,5 mil millones (aproximado) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-0.5B-Instruct, no especificada en la ficha) |
| Tipos de cuantizacion | 4 bits (MatMulNBits) e int8 |
| Idiomas soportados | No disponibles (el modelo base Qwen2.5 soporta multiples idiomas, pero la ficha no los detalla) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (model_q4.onnx y model_quantized.onnx) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5 mil millones de parámetros. Sobre esta base se aplicó un ajuste fino con LoRA (Low-Rank Adaptation) para especializarlo en la generación de documentos Panels. El entrenamiento se realizó con un system message fijo: "Write a Panels DSL document for the request." El dataset de entrenamiento es sintético y cubre diez arquetipos de aplicaciones con estado, aunque no se especifican el número de tokens ni la composición exacta del corpus.

La innovación técnica principal no está en la arquitectura del modelo, sino en su integración con un motor de decodificación restringida por gramática a nivel de caracteres. Esta gramática elimina de la distribución de probabilidad cualquier token que produzca un error de sintaxis, un campo no declarado o un efecto aplicado a un tipo incorrecto. El ajuste fino se centra en las convenciones del lenguaje y en la finalización de documentos, ya que la gramática por sí sola no puede decidir cuándo un documento está completo. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Generacion de documentos Panels: produce código en el lenguaje declarativo Panels para aplicaciones con estado, siguiendo las convenciones aprendidas durante el ajuste fino.
- Decodificacion restringida por gramatica: al ejecutarse detrás de la gramática, el modelo no puede generar errores de sintaxis, nombres de campos no declarados ni efectos con tipos incorrectos.
- Ejecucion en navegador: gracias a los formatos ONNX cuantizados, puede ejecutarse con WebGPU (modelo de 4 bits) o con el backend WASM (modelo int8) mediante transformers.js.
- Finalizacion de documentos: el ajuste fino permite que el modelo sepa cuándo un documento está completo, logrando un 100% de terminación sin intervención en las pruebas.
- Generalizacion limitada a arquetipos: maneja bien los diez arquetipos sintéticos de aplicaciones con los que fue entrenado, pero generaliza pobremente fuera de ellos.
- No incluye tool calling, capacidades de agente, visión ni audio.

## Casos de uso

- Generacion de interfaces de usuario declarativas: el modelo puede crear documentos Panels que describen botones, campos y lógica de estado para aplicaciones sencillas, garantizando que el resultado sea sintácticamente válido gracias a la gramática.
- Prototipado rapido de aplicaciones con estado: un desarrollador puede describir en lenguaje natural una petición como "un contador con botones de incremento y decremento" y obtener un documento Panels ejecutable sin escribir código manualmente.
- Generacion de formularios y paneles de control: dentro de los arquetipos entrenados, el modelo produce estructuras de formularios o dashboards con campos y acciones correctamente tipadas, listas para cargar en el runtime.
- Automatizacion de tareas de UI en el navegador: al ejecutarse con WebGPU, el modelo puede generar documentos Panels directamente en el cliente, sin necesidad de servidor, lo que permite aplicaciones offline o con baja latencia.
- Integracion en pipelines de generacion de codigo: el modelo puede usarse como componente en un sistema mayor que combine la gramática Panels con otras herramientas, por ejemplo para generar vistas de datos a partir de peticiones de usuario.
- Educacion y demostracion de decodificacion restringida: sirve como ejemplo práctico de cómo combinar un modelo de lenguaje pequeño con una gramática formal para obtener salidas fiables, útil para investigacion o enseñanza.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de evaluacion sobre 126 peticiones reservadas, con vocabulario disjunto del corpus de entrenamiento. La puntuacion se realiza por ejecucion: cada documento generado se carga en el runtime, se hacen clic en sus botones y se compara la salida renderizada con lo que la peticion requeria. No interviene ningun modelo evaluador.

| Metrica | Base (Qwen2.5-0.5B-Instruct) | Fine-tuned (Panels 0.5B) |
|---|---|---|
| Behaviour score (media) | 35,5% | 93,4% |
| Completamente correcto | 8,7% | 77,0% |
| Terminado sin intervencion | 59,5% | 100% |
| Longitud de prompt (tokens) | 675 | 32 |
| Parses correctos | 100% | 100% |

El 100% de parses en ambos casos se debe a que la gramatica hace imposible cualquier otro resultado. No se han publicado resultados en benchmarks generales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 0,5B cuantizado a 4 bits, la huella de memoria es muy reducida, del orden de cientos de megabytes. No se especifica un valor exacto.
- GPU recomendadas: cualquier GPU compatible con WebGPU puede ejecutar el modelo de 4 bits. Para el backend WASM no se requiere GPU, solo un navegador moderno con soporte de WebAssembly.
- Compatibilidad con GPU de consumo: sí, cabe en cualquier GPU de consumo moderna, incluidas integradas, gracias a la cuantizacion y al tamano reducido.
- Opciones de despliegue: transformers.js con ONNX Runtime Web, tanto con backend WebGPU como WASM. No se mencionan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Dado el tamano del modelo, se espera una generacion rapida en hardware moderno, pero no hay cifras publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de otros modelos en la misma tarea (generacion de documentos Panels). La unica comparativa publicada es contra el modelo base Qwen2.5-0.5B-Instruct, que se muestra en la tabla de benchmarks. Como alternativa generica de tamano similar, Qwen2.5-0.5B-Instruct es el punto de partida, pero sin ajuste fino no alcanza la fiabilidad del modelo Panels. Otros modelos de 0,5B como SmolLM2-0.5B podrian ser comparables en tamano, pero no hay datos de evaluacion en este dominio especifico.

## Limitaciones y advertencias

- Entrenado exclusivamente en diez arquetipos sinteticos de aplicaciones: maneja bien esas formas, pero generaliza pobremente fuera de ellas y puede "encajar" una peticion desconocida en el arquetipo mas cercano que conoce.
- La gramatica garantiza la validez sintactica y de tipos, pero no la correccion semantica: un documento puede ser valido y aun asi no cumplir la intencion de la peticion.
- El system message es fijo: el modelo fue entrenado con el prompt exacto "Write a Panels DSL document for the request." Usar otro prompt produce un comportamiento impredecible.
- Los dos formatos ONNX no son intercambiables: el modelo de 4 bits requiere WebGPU, mientras que el int8 esta pensado para WASM; usarlos en el backend equivocado puede fallar.
- No se han documentado sesgos especificos, pero al ser un modelo pequeno entrenado con datos sinteticos, puede presentar alucinaciones en peticiones fuera de su dominio.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la idoneidad para produccion en entornos no controlados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pontus-espe/panels-0.5b
- Repositorio de Panels (lenguaje DSL): https://github.com/pontus-espe/panels
- Perfil de GitHub del autor: https://github.com/pontus-espe

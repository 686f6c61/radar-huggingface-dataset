# dktirta/sikepo-explainer-lora-experiment-v4

## Resumen

NALAR by SIKEPO es un adaptador LoRA desarrollado por el usuario dktirta sobre el modelo base Qwen/Qwen3-4B-Instruct-2507. No se trata de un modelo entrenado desde cero, sino de un ajuste fino de bajo rango (PEFT/LoRA) orientado a una tarea muy concreta: generar resúmenes en formato JSON que expliquen indicadores de verificación de reclamaciones sanitarias y las necesidades de evidencia asociadas, en indonesio. El adaptador se entrenó sobre 8.000 pares sintéticos de instrucción-respuesta construidos a partir de plantillas, sin utilizar datos reales de participantes del programa JKN ni historiales clínicos.

El modelo recibe como entrada códigos de señal de reglas, marcadores de anomalía generados por ML y puntuaciones de escenario, y debe producir una salida JSON con los campos `summary` y `checks`. Es, por tanto, un experimento de nicho dentro del ámbito de salud y seguros, con un alcance deliberadamente limitado y una evaluación independiente muy reducida (14 combinaciones de señales sintéticas).

Su relevancia es acotada: sirve como ejemplo de adaptación de un modelo instruct de 4B parámetros a una tarea estructurada de dominio específico mediante LoRA, con licencia Apache-2.0 y pesos publicados en formato safetensors. No debe confundirse con un sistema de decisión: el propio autor advierte que el modelo no está facultado para determinar fraude, aprobación, rechazo o pago de reclamaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen3-4B-Instruct-2507 |
| Parametros totales | No disponible (el adaptador LoRA es un subconjunto de bajo rango; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache-2.0 (adaptador); el modelo base conserva sus propios terminos |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen3-4B-Instruct-2507, un transformer denso de 4.000 millones de parametros en su version instruct. Sobre el se aplica un ajuste LoRA, que congela los pesos originales e introduce matrices de bajo rango entrenables en determinadas capas. El repositorio usa la libreria `peft` y publica unicamente los pesos del adaptador en safetensors; el modelo base debe descargarse por separado.

El entrenamiento se realizo sobre 8.000 pares de instruccion y respuesta sinteticos, generados mediante plantillas. Las entradas combinan codigos de senal de reglas, marcadores de anomalia de ML y puntuaciones de escenario; las salidas esperadas son objetos JSON con `summary` y `checks`. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales, ni se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset o hiperparametros del LoRA (rango, alpha, capas objetivo). La revision concreta del adaptador evaluada y utilizada por SiKePO es `f93d42c68503f6b9f8d18dd2d018cb5bff91edd8`.

## Capacidades

- Generacion de resumenes estructurados en JSON con los campos `summary` y `checks` a partir de senales de reglas, anomalias ML y puntuaciones de escenario.
- Explicacion de indicadores de verificacion de reclamaciones y de las necesidades de evidencia asociadas, en indonesio.
- Salida en formato JSON apta para integracion en pipelines automatizados.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (generacion de texto, razonamiento e instrucciones), aunque el adaptador esta especializado en la tarea descrita.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para el adaptador.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: el adaptador esta orientado al indonesio; el modelo base puede tener otras, pero no se documentan aqui.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Explicacion de senales de verificacion en reclamaciones sanitarias: el adaptador recibe codigos de regla y marcadores de anomalia y devuelve un JSON con un resumen y una lista de comprobaciones, util como capa de explicabilidad para revisores humanos en el contexto del programa JKN.
- Generacion de borradores de justificacion de evidencia: a partir de puntuaciones de escenario, el modelo produce un texto que enumera que documentacion adicional seria necesaria, agilizando la revision manual.
- Integracion en herramientas internas de auditoria: la salida JSON con `summary` y `checks` puede consumirse directamente por un sistema de gestion de casos para mostrar explicaciones al auditor.
- Prototipado rapido de asistentes de dominio sanitario en indonesio: al ser un adaptador LoRA ligero sobre un 4B, permite iterar sobre la tarea concreta sin reentrenar el modelo base.
- Experimentacion academica sobre ajuste PEFT en dominios regulados: sirve como referencia reproducible (repositorio de codigo y revision fijada) para estudiar como adaptar un instruct model a tareas estructuradas con datos sinteticos.
- Formacion y demostraciones: util para mostrar el flujo completo senal -> explicacion JSON en talleres o pruebas de concepto, siempre con la advertencia de que no sustituye la decision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor menciona una evaluacion independiente sobre 14 combinaciones de senales sinteticas, cuyos detalles estan en `independent-evaluation.json` e `independent-cases.json` dentro del repositorio, pero no se proporcionan cifras en la informacion facilitada. El propio autor advierte que esta prueba sintetica de pequeno tamano no demuestra rendimiento frente a reclamaciones reales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica para el adaptador; depende del modelo base Qwen3-4B-Instruct-2507. Como referencia orientativa, un modelo denso de 4B en FP16 requiere aproximadamente 8 GB de VRAM, y en cuantizacion de 4 bits alrededor de 2,5-3 GB, aunque estos valores no estan confirmados en la informacion proporcionada.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: probable en GPUs consumer con suficiente VRAM para el modelo base (por ejemplo, RTX 3060 12 GB o superiores), pero no confirmado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base y aplicar el adaptador mediante `peft`/Transformers; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (adaptadores LoRA especializados en explicacion de reclamaciones sanitarias en indonesio). Como referencia estructural, el modelo base Qwen3-4B-Instruct-2507 es el punto de partida, pero no se ofrecen datos de rendimiento comparativos.

## Limitaciones y advertencias

- El adaptador se entreno exclusivamente con datos sinteticos generados por plantillas; no se utilizaron datos reales de participantes JKN ni historiales clinicos, por lo que su comportamiento en casos reales no esta validado.
- La evaluacion independiente cubre solo 14 combinaciones de senales sinteticas y, segun el autor, no demuestra rendimiento frente a reclamaciones reales.
- Los valores, etiquetas y referencias de escenario no constituyen reglas oficiales de BPJS.
- El modelo no esta facultado para determinar fraude, aprobacion, rechazo o pago; sus explicaciones deben ser verificadas por personal humano.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente al operar fuera de la distribucion de las plantillas de entrenamiento.
- Cobertura linguistica limitada al indonesio; no se documenta soporte para otros idiomas en el adaptador.
- Licencia Apache-2.0 para el adaptador, pero el modelo base Qwen3-4B-Instruct-2507 mantiene sus propios terminos y derechos, que deben respetarse.
- No se documentan sesgos especificos, pero al derivarse de plantillas sinteticas puede reproducir los sesgos implicitos en su diseno.
- El repositorio tiene un tamano de 0.0 GB y muy pocas descargas (8) y likes (0), lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/dktirta/sikepo-explainer-lora-experiment-v4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de codigo de entrenamiento y evaluacion: https://github.com/dkfadhila/sikepo_bpjs

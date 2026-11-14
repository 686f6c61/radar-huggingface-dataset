# SiliconPsycheLabs/minicpm5-1b-toolguard-multigoal-lora

## Resumen

ToolGuard es un adaptador LoRA de correccion conductual publicado por Silicon Psyche Labs sobre el modelo base openbmb/MiniCPM5-1B. No es un modelo nuevo: es un ajuste fino (PEFT) que modifica el comportamiento del modelo base cuando opera como agente con herramientas, reduciendo la probabilidad de que ejecute instrucciones maliciosas embebidas en documentos, correos o resultados de herramientas (prompt injection indirecta). El repositorio contiene unicamente los pesos del adaptador en safetensors, con licencia Apache-2.0.

El modelo base MiniCPM5-1B es un transformer decoder-only de aproximadamente 1.000 millones de parametros (el dato exacto no figura en la informacion disponible), con plantilla de chat propia para tool calling que el adaptador espera encontrar intacta. El adaptador esta entrenado sobre datos autorales que cubren seis tecnicas de inyeccion y cuatro objetivos de atacante, en cinco idiomas (en, it, fr, es, de).

La relevancia practica es limitada y el propio autor lo advierte de forma explicita: la model card marca el artefacto como "INCORRECT AS A CLAIM OF PROTECTION" desde el 13 de noviembre de 2026. Frente a un atacante que reescribe su texto hasta 800 veces por caso, el modelo de 32B corregido con la misma metodologia fue vulnerado en al menos 26 de 80 casos (frente a al menos 68 de 80 del base). Ademas, la tasa de "benign fetch kept" cae a 0,333 frente a un objetivo de 0,90, lo que indica una degradacion acusada del comportamiento benigno esperado. Debe tratarse como material de investigacion reproducible, no como defensa desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (MiniCPM5-1B) |
| Parametros totales | no disponible (adaptador; el base es de ~1B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, it, fr, es, de |
| Licencia | Apache-2.0 (pesos del adaptador; el modelo base conserva su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA estandar cargable con `peft.PeftModel.from_pretrained` sobre `openbmb/MiniCPM5-1B`. No se especifican en la informacion disponible el rango (rank), alpha, modulos objetivo ni el numero de pasos de entrenamiento. El adaptador depende de la plantilla de chat de tool calling del modelo base, que se incluye en el repositorio; sin esa plantilla el comportamiento esperado no se reproduce.

El entrenamiento se realizo sobre datos autorales (no se indica volumen de tokens ni composicion detallada) que cubren seis tecnicas de inyeccion y cuatro objetivos de atacante, en cinco idiomas. La metodologia del laboratorio consiste en leer el comportamiento del modelo a partir de su salida, mapearlo a metricas de la literatura y ajustar el modelo para corregir la deriva observada. No se documentan RLHF, DPO ni decodificacion especulativa. La model card reporta evaluacion contra tecnicas y objetivos no vistos durante el entrenamiento (0,0 de tasa de accion inyectada), lo que sugiere cierta generalizacion dentro del espacio de ataques evaluado, pero no frente a ataques adaptativos.

## Capacidades

- Generacion de texto conversacional multi-turno sobre el modelo base MiniCPM5-1B.
- Tool calling segun la plantilla de chat nativa del base: envio de correo, borrado de ficheros, transferencias, concesion de privilegios administrativos.
- Correccion conductual: reduce la tasa de ejecucion de instrucciones inyectadas en contenido no confiable (paginas web, correos, ficheros, resultados de herramientas).
- Mantenimiento del uso de herramientas cuando lo solicita el usuario legitimo (tasa reportada de 1,0).
- Cobertura multilingue del ajuste en cinco idiomas: ingles, italiano, frances, espanol y aleman.
- No se documentan capacidades de vision, audio, modo thinking explicito ni razonamiento multi-paso mas alla del bucle agente basico.

## Casos de uso

- Investigacion en seguridad de agentes: replicar la evaluacion de inyeccion indirecta sobre un base de 1B para estudiar como escala la robustez con el tamano del modelo (el autor compara con un resultado en 32B). Adecuado por la reproducibilidad del adaptador y la disponibilidad del codigo de carga.
- Banco de pruebas de pipelines agente: medir la tasa de acciones inyectadas antes y despues del adaptador en frameworks propios, tal como exige la propia model card ("results on other agent frameworks need their own measurement").
- Analisis de degradacion funcional: cuantificar el coste en comportamiento benigno (fetch legitimo cae a 0,333) para calibrar compromisos entre seguridad y utilidad en agentes pequenos.
- Docencia y formacion: ilustrar con un caso real y documentado los limites de las defensas por ajuste fino frente a ataques adaptativos con reescritura iterativa.
- Prototipado de bajo coste en local: al ser un adaptador sobre un base de ~1B, permite experimentar con agentes con herramientas en hardware modesto antes de escalar a modelos mayores.
- Auditoria de plantillas de tool calling: verificar como la plantilla del base condiciona la eficacia del ajuste y sirve de vector o de mitigacion segun su diseno.
- Registro historico de metodologia: conservar el artefacto como referencia de una linea de investigacion concreta (correccion conductual medida por salida), dado que el autor lo mantiene disponible como "record".

## Benchmarks y rendimiento

Resultados reportados en la model card (tasa de acciones inyectadas ejecutadas; base frente a corregido; cinco idiomas). La tabla original deja vacia la columna del base para las tres primeras filas.

| Metrica | Base | Corregido |
|---|---|---|
| Accion inyectada, cuatro objetivos entrenados | no disponible | 0,0 |
| Objetivo nunca entrenado | no disponible | 0,0 |
| Tecnicas nunca entrenadas | no disponible | 0,0 |
| Cada herramienta sigue usandose cuando el usuario lo pide | no disponible | 1,0 |
| Fetch benigno conservado | no disponible | 0,333 (objetivo 0,90) |

Dato adicional citado en el aviso: contra un atacante con hasta 800 reescrituras por caso, el modelo de 32B corregido con la misma metodologia fue vulnerado en al menos 26 de 80 casos, frente a al menos 68 de 80 del base. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; para un base de ~1B en fp16 el orden de magnitud habitual es de 2-3 GB, cifra no confirmada en la informacion proporcionada.
- GPU recomendadas: no disponibles. Por tamano, el base cabe con holgura en GPU de consumo, pero no se documentan modelos concretos.
- Cabe en GPU de consumo: presumiblemente si, dado el tamano del base; sin confirmacion en la model card.
- Opciones de despliegue: carga via `transformers` + `peft` (unico flujo documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI; la naturaleza de adaptador PEFT y la dependencia de la plantilla de chat del base complican el uso directo en motores que no soporten adaptadores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas comparables en la informacion proporcionada. Comparativa estructural:

| Modelo | Tipo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| SiliconPsycheLabs/minicpm5-1b-toolguard-multigoal-lora | LoRA sobre MiniCPM5-1B | adaptador (~1B base) | no disponible | Apache-2.0 | Correccion frente a prompt injection indirecta |
| openbmb/MiniCPM5-1B | Modelo base | ~1B | no disponible | la del base | Generacion y tool calling sin correccion |
| Alternativas de defensa por ajuste fino | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es una proteccion: el autor lo declara explicitamente. Reduce la frecuencia de obediencia a instrucciones inyectadas, no la elimina.
- Vulnerable a ataques adaptativos: con reescritura iterativa (hasta 800 variantes por caso) la defensa cede; en el modelo de 32B con la misma metodologia, al menos 26 de 80 casos fueron comprometidos.
- Degradacion funcional grave: la tasa de fetch benigno conservado es 0,333 frente al objetivo 0,90; el adaptador puede romper flujos legitimos del agente.
- Generalizacion acotada: entrenado sobre seis tecnicas y cuatro objetivos; el rendimiento en otros frameworks de agentes exige medicion propia.
- Dependencia de la plantilla de chat del base: un cambio de plantilla o de formato de tool calling invalida el comportamiento esperado.
- Riesgo de alucinacion: inherente al modelo base; no se documentan mitigaciones especificas.
- Sesgos: no documentados en la informacion disponible.
- Licencia: pesos del adaptador en Apache-2.0, pero el uso requiere el modelo base, sujeto a su propia licencia; verificar antes de uso comercial.
- Estado experimental y artefacto marcado como incorrecto para su uso como defensa; no desplegar en produccion como control de seguridad.
- Contexto e idiomas: cinco idiomas cubiertos; el resto sin garantia. Longitud de contexto no disponible.

## Enlaces

- Hugging Face: https://huggingface.co/SiliconPsycheLabs/minicpm5-1b-toolguard-multigoal-lora
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-1B
- Silicon Psyche Labs: https://splabs.io

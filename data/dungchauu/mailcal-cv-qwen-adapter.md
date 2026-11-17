# Dungchauu/mailcal-cv-qwen-adapter

## Resumen

MailCal CV Qwen Adapter es un adaptador LoRA publicado por el usuario Dungchauu sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Su proposito es la extraccion estructurada de informacion de curriculos (CV) en un esquema JSON estandar denominado `recruit.cv-extract`, orientado a flujos de reclutamiento automatizado. El adaptador se distribuye como pesos PEFT en formato safetensors y esta etiquetado para text-generation, con soporte declarado de vietnamita e ingles.

El modelo resuelve un problema muy concreto: convertir texto libre de un CV en campos estructurados (nombre del candidato, correo, telefono, ubicacion, puesto y empresa actuales, experiencia, formacion y habilidades) sin que el modelo invente valores cuando un campo no existe. La version V2 se entrena especificamente con una distribucion de ejemplos sin empleo actual para que el modelo emita `state: "missing"` y `value: null` en lugar de alucinar cadenas como `"None"`.

Se trata de un adaptador de muy bajo coste computacional: al apoyarse en Qwen2.5-1.5B-Instruct, puede ejecutarse en GPU de consumo y en CPU, lo que lo hace util para pipelines de extraccion de alto volumen donde el coste por documento es un factor critico. La licencia declarada es Apache 2.0, lo que facilita su integracion comercial sujeta a las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct) |
| Parametros totales | no disponible (adaptador LoRA r=8, alpha=16; base de 1.500 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors; el modelo base admite cuantizacion estandar de transformers/PEFT) |
| Idiomas soportados | vietnamita e ingles (segun tags de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango r=8 y alpha=16 sobre todas las capas de proyeccion del transformer base: `q`, `k`, `v`, `o`, `gate`, `up` y `down`. El modelo subyacente es Qwen2.5-1.5B-Instruct, un transformer decoder-only de la familia Qwen2.5. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO adicionales sobre el adaptador.

La innovacion tecnica declarada es la inclusion deliberada de una distribucion de ejemplos de CV sin empleo actual durante el entrenamiento (V2), de modo que el modelo aprenda a emitir explicitamente `state: "missing"` y `value: null` en los campos ausentes. El autor reporta una perdida de validacion (dev loss) de 0.05729 sobre el conjunto de evaluacion. El objetivo de salida es el esquema `recruit.cv-extract`, que cubre nombre del candidato, correo electronico, telefono, ubicacion, puesto y empresa actuales, experiencia, formacion y habilidades.

## Capacidades

- Extraccion de informacion estructurada de CV en JSON conforme al esquema `recruit.cv-extract`.
- Generacion de texto condicionada por instrucciones, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Manejo explicito de campos ausentes mediante `state: "missing"` y `value: null`, reduciendo la alucinacion de valores como `"None"`.
- Soporte declarado de vietnamita e ingles.
- Capacidad de tool calling y razonamiento multi-paso: no documentada especificamente para este adaptador; disponible potencialmente a traves del modelo base, no verificada.
- Capacidades multimodales (vision, audio): no disponibles.

## Casos de uso

- Enriquecimiento de ATS (Applicant Tracking Systems): el adaptador convierte CV en texto plano o PDF extraido a JSON estructurado para poblar bases de datos de candidatos, aprovechando el esquema fijo `recruit.cv-extract`.
- Procesamiento por lotes de bolsas de empleo: al ejecutarse sobre un modelo de 1.5B, permite procesar miles de CV por GPU de consumo con coste por documento bajo.
- Normalizacion de datos de candidatos: extraccion de nombre, correo, telefono y ubicacion para deduplicacion y limpieza de registros existentes.
- Deteccion fiable de campos ausentes: la mejora V2 permite distinguir entre "campo no presente en el CV" y "campo con valor nulo o desconocido", util en validacion de calidad de datos.
- Extraccion bilingue vietnamita-ingles: adecuado para mercados de reclutamiento del sudeste asiatico donde conviven CV en ambos idiomas.
- Preprocesado para ranking de candidatos: la salida JSON estructurada alimenta etapas posteriores de matching y scoring sin necesidad de parseo heuristico fragil.
- Integracion en pipelines de RRHH con PEFT: carga directa mediante `PeftModel.from_pretrained` sobre el modelo base, lo que simplifica el despliegue en infraestructura existente de transformers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento reportado es la perdida de validacion (dev loss) de 0.05729 sobre el conjunto de evaluacion del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en float16 requiere aproximadamente 3 GB de VRAM; en cuantizacion de 8 bits, alrededor de 1.5-2 GB; en 4 bits, en torno a 1 GB. El adaptador LoRA anade una huella minima.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como RTX 3060, RTX 4060 o superiores; A100 y H100 no son necesarias para este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo con 4 GB o mas; tambien es viable en CPU para cargas moderadas.
- Opciones de despliegue: transformers con PEFT (metodo documentado en la model card), vLLM y TGI para servir el modelo base fusionado con el adaptador, llama.cpp/Ollama si se fusionan y convierten los pesos a GGUF (no documentado por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MailCal CV Qwen Adapter | Adaptador LoRA sobre 1.5B | no disponible | Extraccion de CV a JSON | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | no disponible | Instrucciones generales | Apache 2.0 | Hugging Face |
| Alternativas especializadas en extraccion de CV | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables especificos de extraccion de CV en la informacion proporcionada.

## Limitaciones y advertencias

- El adaptador esta disenado para un unico esquema (`recruit.cv-extract`); su rendimiento fuera de ese dominio o con otros formatos de salida no esta documentado.
- Solo se declaran vietnamita e ingles; el comportamiento en castellano u otros idiomas no esta verificado y podria degradarse.
- Riesgo de alucinacion en campos no cubiertos por el entrenamiento V2; la mitigacion documentada se limita a los campos ausentes del esquema.
- Sesgos potenciales heredados del modelo base Qwen2.5-1.5B-Instruct y del dataset de entrenamiento, no analizados en la model card.
- La licencia Apache 2.0 del adaptador no exime de cumplir las condiciones del modelo base; conviene revisar la licencia de Qwen2.5-1.5B-Instruct para uso comercial.
- El repositorio presenta 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion externa ni de uso en produccion.
- No se documentan limites de longitud de contexto ni estrategias de truncado para CV largos.
- La fecha de creacion y actualizacion del repositorio (2026) debe verificarse antes de adoptarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Dungchauu/mailcal-cv-qwen-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Libreria PEFT: https://github.com/huggingface/peft

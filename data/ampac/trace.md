# AmPac/trace

## Resumen

Trace es un modelo de screening regulatorio para préstamos de la Small Business Administration (SBA) de Estados Unidos, concretamente para los programas 504 y 7(a). Lo desarrolla AmPac y está pensado para CDFIs (Community Development Financial Institutions) y prestamistas que necesitan verificar rápidamente qué párrafo del Código de Regulaciones Federales (CFR) o qué SOP (Standard Operating Procedure) aplica a una solicitud de préstamo en función de la fecha del número de préstamo. El modelo devuelve la referencia normativa en vigor, un hard-stop (bloqueo) o un bounce (devolución), y un panel de verificación para que un humano certifique elegibilidad y crédito.

Técnicamente, Trace es un adaptador LoRA sobre Qwen2.5-7B-Instruct-4bit en formato MLX, optimizado para Apple Silicon. No es un modelo de propósito general: su función es acotada y especializada en normativa SBA. Recupera el contexto de fuentes oficiales (23 fuentes, 4.775 chunks) en lugar de memorizar el contenido, lo que reduce el riesgo de alucinación normativa. No es un producto de la SBA, no habla en su nombre, no determina elegibilidad ni decide crédito, y no está dirigido a solicitantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-7B-Instruct (transformador) con adaptador LoRA |
| Parametros totales | no disponible (modelo base 7B + adaptador LoRA de tamano no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B-Instruct, no especificada en la ficha) |
| Tipos de cuantizacion | 4-bit (base) + LoRA |
| Idiomas soportados | en |
| Licencia | other (no especificada) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Trace es un adaptador LoRA entrenado sobre el modelo base Qwen2.5-7B-Instruct-4bit, distribuido en formato MLX. El entrenamiento se centra en la tarea de screening normativo: dado un archivo de préstamo, el modelo debe identificar el párrafo del CFR o la SOP en vigor en la fecha del número de préstamo, y devolver un hard-stop o un bounce cuando proceda. La model card indica que el cuerpo de la SOP se recupera (retrieved) en lugar de memorizarse, lo que sugiere un enfoque de retrieval-augmented generation (RAG) con 23 fuentes oficiales y 4.775 chunks. No se especifican detalles sobre el dataset de entrenamiento, el número de tokens, ni si se usó RLHF o DPO. El reloj de SOP (qué versión aplica según la fecha) es código, no parte del modelo.

## Capacidades

- Screening de elegibilidad para prestamos 504 y 7(a) de la SBA.
- Devolucion del parrafo del CFR en vigor (por ejemplo, 13 CFR 120.131 para ocupacion, 13 CFR 120.120 para capital de trabajo, 13 CFR 121.201 para tamano).
- Seleccion de la SOP correcta segun la fecha del numero de prestamo (SOP 50 10 7.1, 50 10 8 o 50 10 8.1).
- Emision de hard-stop (bloqueo) o bounce (devolucion) cuando la solicitud no cumple los requisitos.
- Lookups de tamano de empresa (NAICS + ingresos) y de directorio de franquicias, mediante consultas directas, no RAG.
- Generacion de un panel de verificacion para revision humana.
- Capacidad multilingue: no, solo ingles.

## Casos de uso

- Verificacion de ocupacion en prestamos 504: el modelo analiza si el prestatario ocupara el inmueble y, si no, abre el parrafo 13 CFR 120.131. Adecuado porque la tarea es binaria y esta acotada a una referencia normativa concreta.
- Screening de capital de trabajo o nomina en un 504: detecta si la solicitud incluye usos no permitidos y devuelve 13 CFR 120.120. Util porque el modelo distingue entre tipos de prestamo y aplica la seccion correcta.
- Comprobacion de tamano de empresa: consulta la tabla de estandares de tamano de la SBA (NAICS + ingresos) y devuelve si la empresa supera el limite. Es un lookup directo, no una inferencia, lo que reduce errores.
- Seleccion de la SOP vigente: dado un numero de prestamo con fecha, el modelo elige entre SOP 50 10 7.1, 8 u 8.1. Critico para prestamistas que necesitan saber que procedimiento aplica en cada momento.
- Auditoria interna de carteras: un CDFI puede pasar sus expedientes historicos por Trace para verificar si los prestamos concedidos cumplian la normativa vigente en su fecha. El modelo devuelve la referencia exacta para cada caso.
- Integracion en flujo de originacion: el modelo puede conectarse a un sistema de gestion de prestamos para generar automaticamente un informe de screening preliminar que un oficial de credito revisa antes de aprobar. Su formato MLX permite ejecucion local en equipos Apple.

## Benchmarks y rendimiento

El autor declara en la model card un resultado en ScreenBench (holdout):

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| ScreenBench holdout | Trace all-pass (hard_stop_all_pass) | 1.0 | No |
| ScreenBench holdout | False kill (false_kill_rate) | 0.0 | No |

No se han publicado resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los valores son declarados por el autor y no han sido verificados de forma independiente.

## Requisitos de hardware

- Al estar en formato MLX, esta optimizado para Apple Silicon (M1, M2, M3, M4) con Metal.
- El modelo base es Qwen2.5-7B-Instruct-4bit, por lo que la VRAM necesaria es aproximadamente 4-5 GB para el base mas el adaptador LoRA. Cabe en Macs con 16 GB de RAM unificada o mas.
- No se indican requisitos para GPU NVIDIA, pero al ser un adaptador LoRA sobre un modelo 4-bit, podria convertirse a GGUF y ejecutarse con llama.cpp en GPUs consumer (RTX 3060 12 GB o superior).
- Opciones de despliegue: MLX (nativo), conversion a GGUF para llama.cpp u Ollama, o vLLM si se convierte a safetensors de precision completa.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (screening regulatorio SBA). El modelo es altamente especializado y no existen alternativas publicas conocidas con la misma funcion. Como referencia tecnica, el modelo base Qwen2.5-7B-Instruct es un LLM generico de 7B parametros con contexto de 32K, pero Trace no se compara con el en tareas generales.

## Limitaciones y advertencias

- No es un producto de la SBA: no habla en nombre de la agencia, no determina elegibilidad ni decide credito. Su uso es de apoyo a la decision humana.
- No esta dirigido a solicitantes de prestamos: la model card lo advierte explicitamente.
- Solo soporta ingles.
- La licencia es "other" sin especificar: no se conocen las restricciones exactas para uso comercial. Hay que contactar al autor antes de usarlo en produccion.
- Los benchmarks declarados (ScreenBench) no estan verificados de forma independiente y solo cubren una tarea muy concreta.
- El modelo depende de la recuperacion de fuentes oficiales: si los enlaces a legacy.sba.gov cambian o dejan de estar disponibles, el rendimiento puede degradarse.
- Riesgo de alucinacion en casos limite no cubiertos por las fuentes recuperadas, aunque el diseno con retrieved context lo mitiga.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado sobre normativa estadounidense, puede tener sesgos hacia interpretaciones de ese marco legal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmPac/trace
- SOP 50 10 (pagina oficial SBA): https://www.sba.gov/document/sop-50-10-lender-development-company-loan-programs
- 13 CFR 120.131 (eCFR): https://www.ecfr.gov/current/title-13/section-120.131
- 13 CFR 120.120 (eCFR): https://www.ecfr.gov/current/title-13/section-120.120
- 13 CFR 121.201 (eCFR): https://www.ecfr.gov/current/title-13/section-121.201
- Tabla de estandares de tamano: https://www.sba.gov/document/support-table-size-standards
- Directorio de franquicias: https://www.sba.gov/document/support-sba-franchise-directory
- SOP 50 55 (servicing 504): https://www.sba.gov/document/sop-50-55-504-loan-servicing-liquidation
- SOP 50 57 (servicing 7(a)): https://www.sba.gov/document/sop-50-57-7a-loan-servicing-liquidation
- Aviso de emision de SOP 50 10 8.1: https://www.sba.gov/document/information-notice-5000-880695-issuance-sop-50-10-81

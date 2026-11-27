# schonsense/VOCaboose-SFT-Ripple-65B-T3-T4-GGUF

## Resumen

VOCaboose-SFT-Ripple-65B-T3-T4-GGUF es un modelo de lenguaje conversacional derivado de una arquitectura de aproximadamente 64.800 millones de parametros, publicado por el usuario schonsense en Hugging Face bajo licencia Apache 2.0. El sufijo del nombre indica que se trata de un ajuste fino supervisado (SFT) sobre un modelo base denominado Ripple, con variantes de "traversal" 3 y 4, y que el artefacto distribuido esta en formato GGUF cuantizado para inferencia local. El repositorio ocupa 137,7 GB y contiene los pesos cuantizados.

La model card es extremadamente escueta: se limita a indicar "Traversal 3 AND 4 for testing", una serie de parametros de muestreo recomendados (temperatura 0,8-1,0, min-p 0,08-0,1, repetition penalty 1,008 con rango 1024, DRY con longitud permitida 5) y un system prompt orientado a roleplay con restricciones de formato estrictas (pensamientos internos entre asteriscos, sin hedging lexico, sin adjetivos separados por comas). No se documentan datos de entrenamiento, composicion del dataset, idiomas soportados ni resultados de evaluacion.

El modelo tiene cero descargas y cero likes en el momento de la consulta, y su fecha de creacion (2026-11-27) es posterior a la fecha actual, lo que sugiere que se trata de un artefacto de prueba o de un repositorio con metadatos anomalos. Es relevante unicamente como objeto de evaluacion tecnica para quienes quieran inspeccionar un ajuste fino de 65B en GGUF con fines de roleplay, no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer denso inferido por el numero de parametros; no confirmado) |
| Parametros totales | 64.782.689.360 (64,8B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base Ripple ni sobre el proceso de ajuste fino. El numero de parametros (64,8B) y el nombre sugieren un transformer denso de escala 65B, pero no se confirma si emplea atencion completa, atencion lineal, SSM o una combinacion hibrida. Tampoco se documenta la longitud de contexto nativa ni el tokenizador.

El entrenamiento descrito es un SFT (supervised fine-tuning) sobre el modelo base, con dos variantes de "traversal" (3 y 4) que probablemente corresponden a distintas rondas o configuraciones de ajuste. No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas como decodificacion especulativa. La model card solo aporta hiperparametros de muestreo y un system prompt de roleplay, lo que indica un enfasis en generacion conversacional con control de estilo.

## Capacidades

- Generacion de texto conversacional multi-turno, orientada a roleplay e interpretacion de personajes.
- Control de formato mediante system prompt: pensamientos internos entre asteriscos, ausencia de hedging lexico y restriccion de adjetivos separados por comas.
- Ajuste de estilo mediante parametros de muestreo documentados (temperatura, min-p, repetition penalty, DRY).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Roleplay conversacional controlado: el modelo esta ajustado para mantener un personaje a lo largo de turnos, con un system prompt que fuerza un formato de pensamiento interno y elimina hedging, adecuado para prototipos de narrativa interactiva.
- Pruebas de robustez de formato: util para evaluar como un modelo de 65B responde a restricciones estrictas de estilo (asteriscos, prohibicion de adjetivos encadenados) en entornos de investigacion.
- Evaluacion de cuantizaciones GGUF a gran escala: el repositorio permite estudiar el comportamiento de un modelo de 64,8B cuantizado en distintos niveles, comparando calidad y latencia en hardware consumer o de servidor.
- Generacion de dialogos para datasets sinteticos: puede emplearse para producir conversaciones con un estilo muy definido, utiles como datos de entrenamiento o evaluacion de otros modelos.
- Investigacion sobre sesgos en modelos de roleplay: al no documentarse el dataset, sirve como caso de estudio de riesgos de alucinacion y sesgo en ajustes finos opacos.
- Benchmarking de inferencia local: con 137,7 GB de pesos, es un caso practico para medir throughput y VRAM en configuraciones multi-GPU o con offload a CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; el repositorio GGUF ocupa 137,7 GB, por lo que la inferencia completa requiere al menos esa cantidad de memoria o un esquema de offload.
- GPU recomendadas: no disponibles; por tamano, cabria esperar configuraciones multi-GPU (varias A100 80GB o H100) o una unica GPU con offload parcial a RAM.
- Cabe en consumer GPU: no de forma completa; una RTX 4090 (24 GB) solo podria ejecutar el modelo con cuantizaciones muy agresivas y offload masivo, con latencia alta.
- Opciones de despliegue: llama.cpp, Ollama y otros runners compatibles con GGUF; vLLM y TGI requeririan conversion a safetensors y no estan confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VOCaboose-SFT-Ripple-65B-T3-T4-GGUF | 64,8B | no disponible | Apache 2.0 | GGUF | Hugging Face, 0 descargas |
| Llama 3.1 70B | 70B | 128K | Llama 3.1 Community | safetensors, GGUF | Amplia |
| Qwen2.5 72B | 72B | 128K | Apache 2.0 | safetensors, GGUF | Amplia |
| Mistral Large 2 | 123B | 128K | Mistral Research | safetensors | API y pesos |

La comparativa se limita a tamano y licencia: no hay datos de rendimiento del modelo de schonsense que permitan contrastarlo con Llama 3.1 70B o Qwen2.5 72B, y su disponibilidad es practicamente nula (cero descargas, sin documentacion).

## Limitaciones y advertencias

- Model card practicamente vacia: sin datos de entrenamiento, dataset, idiomas ni evaluacion, lo que impide auditar sesgos o calidad.
- Riesgo alto de alucinacion y de comportamientos no documentados al ser un ajuste fino de proposito desconocido.
- Fecha de creacion posterior a la actual y cero descargas: posible artefacto de prueba, metadatos anomalos o repositorio no validado.
- Sin informacion sobre longitud de contexto ni tokenizador, lo que complica su integracion en produccion.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de documentacion sobre el modelo base Ripple impide verificar la procedencia y las obligaciones heredadas.
- Enfasis en roleplay con restricciones de formato estrictas: puede degradar el rendimiento en tareas generales de codigo, matematicas o razonamiento.
- Tamano de 137,7 GB en GGUF: inviable en hardware consumer sin offload, con latencia y throughput no garantizados.

## Enlaces

- Hugging Face: https://huggingface.co/schonsense/VOCaboose-SFT-Ripple-65B-T3-T4-GGUF

# Jluedy/Tifa-Deepsex-14b-CoT-GGUF

## Resumen

Tifa-Deepsex-14b-CoT-GGUF es la distribucion en formato GGUF del modelo Tifa-Deepsex-14b-CoT, un ajuste fino de 14.770.033.664 parametros orientado a roleplay conversacional y a la generacion de cadenas de razonamiento (chain of thought, CoT). El modelo original lo publica el usuario ValueFX9507 en Hugging Face y esta cuantizado en este repositorio por Jluedy, que actua como redistribuidor de los pesos en GGUF para su uso con llama.cpp y entornos compatibles.

El modelo parte de una base de 14B y ha sido sometido a un proceso de entrenamiento declarado como incremental pretraining, SFT y reinforcement learning, segun las etiquetas del autor. Su enfasis esta en el dialogo de rol con detalle narrativo y en la exposicion del razonamiento interno antes de responder, lo que lo hace adecuado para escenarios de conversacion creativa y simulacion de personajes mas que para tareas de ingenieria o analisis factual.

La relevancia de esta ficha es acotada: se trata de un modelo comunitario con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados ni documentacion tecnica detallada. Su interes practico reside en la disponibilidad de cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo, y en su licencia Apache 2.0, que facilita su reutilizacion incluso comercial dentro de los limites de esa licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle de capas y atencion no disponible) |
| Parametros totales | 14.770.033.664 (14,77B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en transformers/safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de tratarse de un transformer de aproximadamente 14,77B parametros. Las etiquetas del autor indican un pipeline de reinforcement learning y un proceso de entrenamiento que combina incremental pretraining, supervised fine-tuning (SFT) y reinforcement learning. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas como DPO o RLHF con retroalimentacion humana explicita.

La caracteristica tecnica declarada mas relevante es la incorporacion de chain of thought (CoT): el modelo esta entrenado para producir un razonamiento explicito antes de la respuesta final, lo que en teoria mejora la coherencia en tareas de varios pasos y en la construccion de narrativa de rol. No hay informacion sobre innovaciones adicionales como decodificacion especulativa, atencion lineal o arquitecturas hibridas. Las cuantizaciones GGUF son estaticas (no imatrix); el autor remite a una version i1 con cuantizaciones ponderadas en un repositorio separado de mradermacher.

## Capacidades

- Generacion de texto conversacional multi-turno orientada a roleplay y simulacion de personajes.
- Razonamiento explicito mediante cadena de pensamiento (CoT) antes de la respuesta final.
- Generacion de narrativa creativa y dialogos con continuidad de contexto dentro de la ventana disponible.
- Capacidades multilingues limitadas a chino e ingles; no se declara soporte de castellano.
- Soporte de tool calling / function calling: no disponible segun la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso mas alla del CoT: no disponible.
- Capacidades de vision o audio: no disponibles.
- Modo thinking explicito: si, mediante el entrenamiento en CoT.

## Casos de uso

- Roleplay conversacional y simulacion de personajes: el modelo esta entrenado especificamente para mantener dialogos de rol con coherencia narrativa y exposicion de razonamiento interno, lo que encaja en plataformas de entretenimiento conversacional.
- Generacion de ficcion interactiva: su entrenamiento en CoT permite construir tramas de varios pasos y justificar decisiones narrativas antes de escribir la escena siguiente.
- Prototipado de chatbots de personaje en local: las cuantizaciones Q4_K_M (9,1 GB) permiten desplegar el modelo en una GPU de consumo para pruebas de concepto sin coste de API.
- Investigacion sobre CoT en modelos pequenos: sirve como caso de estudio de como el SFT y el RL con cadenas de razonamiento afectan a la calidad del dialogo en modelos de 14B.
- Generacion de dialogos para videojuegos o narrativa ramificada: el modelo puede producir respuestas de personaje condicionadas por contexto previo, util para prototipos de guion.
- Evaluacion comparativa de cuantizaciones GGUF: el repositorio ofrece once variantes de cuantizacion, lo que permite medir el impacto de la compresion en la calidad del dialogo y del razonamiento.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local con llama.cpp, los datos conversacionales no salen del equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun tamano de cuantizacion):
  - Q2_K (5,9 GB): ~6-7 GB de VRAM.
  - Q4_K_M (9,1 GB): ~10-11 GB de VRAM.
  - Q5_K_M (10,6 GB): ~11-12 GB de VRAM.
  - Q6_K (12,2 GB): ~13-14 GB de VRAM.
  - Q8_0 (15,8 GB): ~16-17 GB de VRAM.
- GPU recomendadas: RTX 4090 (24 GB) para Q8_0 con holgura; RTX 3090 o RTX 4080 para Q4_K_M y Q5_K_M; GPUs de 8-12 GB para Q2_K y Q3_K. Para despliegues en servidor, A100 o H100 no son necesarias dado el tamano, pero permiten mayor throughput.
- Cabe en GPU de consumo: si, desde una RTX 3060 de 12 GB con Q4_K_S/Q4_K_M, o GPUs de 8 GB con Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con la API de endpoints. El modelo original en transformers puede servirse con vLLM o TGI, aunque no se documenta en esta ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tifa-Deepsex-14b-CoT-GGUF | 14,77B | no disponible | Apache 2.0 | GGUF en HF | Roleplay y CoT, zh/en |
| Modelos de roleplay de 13-14B de la comunidad | ~13-14B | variable | variable | GGUF en HF | No disponible comparativa directa con benchmarks |
| Modelos base de 14B (p. ej. familia Qwen de 14B) | ~14B | variable | variable | safetensors y GGUF | No disponible comparativa de rendimiento |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas. La comparativa se limita a parametros, licencia y formato de distribucion.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como `not-for-all-audiences` y con la etiqueta `sex`; no es apto para todos los publicos y requiere moderacion en produccion.
- Idiomas: solo se declaran chino e ingles; el rendimiento en castellano no esta garantizado ni documentado.
- Sesgos: no hay informacion sobre evaluaciones de sesgo; al ser un ajuste fino comunitario sin documentacion, el riesgo de sesgos no mitigados es alto.
- Alucinacion: sin benchmarks ni evaluaciones, no se puede estimar la tasa de alucinacion; en roleplay el riesgo se traslada a incoherencias narrativas.
- Contexto: la longitud de contexto no esta documentada, lo que impide planificar conversaciones largas con garantias.
- Licencia: Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas de contenido adulto segun la jurisdiccion; el redistribuidor no ofrece garantias.
- Madurez: cero descargas y cero likes en el momento de la consulta, creado y actualizado el mismo dia; sin validacion de la comunidad.
- Procedencia: el modelo base es de un autor comunitario (ValueFX9507) sin documentacion tecnica publica; la trazabilidad del entrenamiento es limitada.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Jluedy/Tifa-Deepsex-14b-CoT-GGUF
- Modelo base: https://huggingface.co/ValueFX9507/Tifa-Deepsex-14b-CoT
- Cuantizaciones i1 (ponderadas): https://huggingface.co/mradermacher/Tifa-Deepsex-14b-CoT-i1-GGUF
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#Tifa-Deepsex-14b-CoT-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests

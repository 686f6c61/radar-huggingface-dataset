# FINAL-Bench/POCKET-35B-GGUF

## Resumen

POCKET-35B-GGUF es la distribucion en formato GGUF del modelo Darwin-36B-Opus de FINAL-Bench, un modelo de lenguaje de tipo mixture-of-experts disperso con 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token. El objetivo declarado por el autor es ofrecer inferencia local en PC sin GPU, apoyandose en llama.cpp y en un conjunto de cuantizaciones que van desde IQ1_M (unos 8,2 GB) hasta Q4_K_M (unos 21 GB). El modelo base esta etiquetado como qwen3_5_moe, lo que sugiere una arquitectura derivada de la familia Qwen 3.5 MoE.

La relevancia actual del artefacto es doble: por un lado, permite ejecutar un modelo de casi 35.000 millones de parametros en equipos de consumo con 16-32 GB de RAM gracias a la esparsidad del MoE; por otro, la licencia Apache-2.0 elimina las restricciones habituales de uso comercial de otros modelos abiertos. El repositorio acumula mas de 531.000 descargas y una actualizacion reciente en noviembre de 2026, lo que indica mantenimiento activo.

Conviene subrayar que este repositorio contiene las builds de modelo completo para PC, no las variantes de aproximadamente 5 GB para telefono, que se distribuyen en repositorios separados (POCKET-KR-GGUF, POCKET-KR-MLX y POCKET-EN-GGUF). La model card esta redactada en ingles aunque describe el ajuste como "Korean-tuned", y no detalla la composicion del dataset ni los idiomas soportados de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts disperso (etiqueta qwen3_5_moe, soporte en llama.cpp) |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | Aproximadamente 3 B por token |
| Longitud de contexto | No disponible (el ejemplo de ejecucion usa -c 4096, pero no se declara un maximo) |
| Tipos de cuantizacion | IQ1_M, Q2_K, Q3_K_M, Q4_K_M (con imatrix) |
| Idiomas soportados | No disponible (la model card indica "Korean-tuned" sin lista formal) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); existe un artefacto MLX separado en otro repositorio |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos dispersa: de los 34,66 B de parametros totales solo se activan aproximadamente 3 B por token, lo que reduce drasticamente el coste computacional por token generado y explica que pueda ejecutarse en CPU. La etiqueta qwen3_5_moe y el requisito de una build de llama.cpp con soporte para dicha arquitectura indican que el grafo computacional sigue el esquema de la familia Qwen 3.5 MoE. El checkpoint de partida es FINAL-Bench/Darwin-36B-Opus, del que este repositorio es una conversion cuantizada; la model card no documenta el proceso de destilacion, ajuste o alineacion que dio lugar al modelo base.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF, DPO o ajuste supervisado. La unica pista sobre el ajuste es la descripcion "Korean-tuned", que sugiere una especializacion en coreano, pero sin datos cuantitativos sobre la mezcla linguistica. Las cuantizaciones se han generado con imatrix, una tecnica de calibracion por importancia que mejora la calidad de los formatos de baja precision (IQ1_M, Q2_K) respecto a la cuantizacion uniforme.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y la etiqueta "conversational" indica un ajuste orientado a dialogo multi-turno.
- Ejecucion en CPU: el modelo esta disenado para correr sin GPU mediante llama.cpp con `--device none -ngl 0`, lo que lo hace apto para equipos sin acelerador dedicado.
- Inferencia local y on-device: las etiquetas incluyen "on-device", "local-llm" y "edge", orientadas a privacidad y despliegue sin dependencia de la nube.
- Multilinguee parcial: la model card menciona ajuste en coreano y existen derivados separados para coreano e ingles, pero no se publica una lista de idiomas ni evaluaciones por idioma.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con APIs compatibles con el formato de Hugging Face.
- Soporte de tool calling, function calling, agentes, vision, audio o modo thinking: no documentado en la informacion disponible.

## Casos de uso

- Asistente conversacional local en PC sin GPU: con la build Q2_K (unos 13 GB) y 16-24 GB de RAM, el modelo puede mantener dialogos multi-turno en un equipo de sobremesa o portatil de gama alta, sin enviar datos a servicios externos.
- Procesamiento de texto con requisitos de privacidad: al ejecutarse integramente en local, es adecuado para resumir documentos internos, clasificar correos o extraer informacion de contratos en entornos donde no se permite la salida de datos.
- Desarrollo y prototipado offline: investigadores que trabajan en portatiles sin GPU pueden usar la build IQ1_M (8,2 GB) para experimentar con un MoE de 35 B y comparar el efecto de la cuantizacion en la calidad.
- Generacion de texto en coreano: dado el ajuste declarado en coreano, es una opcion para redaccion, traduccion o atencion al cliente en ese idioma, siempre que se valide la calidad con la build Q4_K_M, que el autor presenta como la de mayor calidad medida en coreano.
- Despliegue en estaciones de trabajo con 32 GB de RAM: la build Q4_K_M (unos 21 GB) permite usar el modelo como backend de una aplicacion de escritorio o de un servidor interno de baja concurrencia.
- Educacion e investigacion sobre MoE: el contraste entre 34,66 B de parametros totales y 3 B activos lo convierte en un caso practico para estudiar el comportamiento de modelos dispersos bajo cuantizacion agresiva.
- Integracion en herramientas de escritorio: mediante llama.cpp, Ollama o LM Studio, puede incrustarse en editores, IDE o utilidades ofimaticas que requieran generacion de texto sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona una seccion "Quality and evaluation" y afirma que Q4_K_M ofrece "la mayor calidad medida en coreano entre estas builds", pero no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandar, ni comparaciones numericas con modelos alternativos.

## Requisitos de hardware

- VRAM: no aplica en el modo CPU; para ejecucion en GPU no se documentan requisitos, y el autor recomienda explicitamente la ruta sin GPU.
- RAM estimada segun build:
  - IQ1_M (unos 8,2 GB de archivo): 16 GB de RAM segun el autor; mayor perdida de calidad.
  - Q2_K (unos 13 GB): 16-24 GB de RAM; build recomendada para uso diario.
  - Q3_K_M (unos 16 GB): 24 GB de RAM.
  - Q4_K_M (unos 21 GB): 32 GB de RAM; mayor calidad medida en coreano.
- Los tamanos son GB decimales redondeados y no incluyen buffers de contexto, sistema operativo ni otras aplicaciones; el autor advierte que hay que reservar memoria adicional.
- GPU recomendadas: no documentadas. El modelo esta pensado para CPU; no se publican pruebas en A100, H100 ni RTX 4090.
- Opciones de despliegue: llama.cpp (con soporte qwen35moe), Ollama (version compatible con la arquitectura), LM Studio (runtime incluido que soporte la arquitectura) y PocketPal u otros runtimes moviles solo con los derivados especificos para telefono. Para Apple MLX existe un artefacto separado (POCKET-KR-MLX), no este GGUF.
- Latencia y throughput: no disponibles. El autor no publica tokens por segundo ni tiempos de primera respuesta; solo indica que usar el numero de nucleos fisicos en `-t` suele dar mejor throughput que usar todos los hilos logicos.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| POCKET-35B-GGUF (este) | 34,66 B | ~3 B | No disponible | Apache-2.0 | GGUF para llama.cpp, CPU-first |
| POCKET-26B-GGUF (mismo autor) | No disponible en la informacion | No disponible | No disponible | No disponible | GGUF |
| POCKET-Darwin-180B-GGUF (mismo autor) | No disponible en la informacion | No disponible | No disponible | No disponible | GGUF |
| Darwin-36B-Opus (modelo base) | No disponible en la informacion | No disponible | No disponible | No disponible | Pesos originales |

No se dispone de datos de rendimiento comparado con alternativas de otros autores (por ejemplo, otros MoE abiertos de tamano similar) en la informacion proporcionada, por lo que la comparativa se limita a la familia POCKET del mismo editor.

## Limitaciones y advertencias

- Idiomas: la model card no publica una lista formal de idiomas soportados; el ajuste declarado es en coreano, y el rendimiento en castellano no esta documentado ni evaluado.
- Cuantizacion agresiva: las builds IQ1_M y Q2_K implican perdida de calidad frente al checkpoint original; el autor solo avala Q4_K_M como la de mayor calidad medida, y unicamente en coreano.
- Sin benchmarks publicos: no hay cifras de MMLU, HumanEval, GSM8K ni evaluaciones de alucinacion, sesgo o seguridad, lo que dificulta la comparacion objetiva con alternativas.
- Compatibilidad de runtime fragil: requiere una build de llama.cpp con soporte qwen35moe; el autor no proporciona un hash o version exacta para todas las mediciones, y advierte que el mismo formato no garantiza soporte en todas las apps o versiones.
- Memoria: los tamanos de archivo no equivalen al consumo de proceso; el contexto, los buffers del runtime y el sistema operativo anaden consumo, y una configuracion ajustada puede provocar errores de memoria.
- Uso en telefono: este repositorio no contiene las builds para movil; usar estos ficheros en un telefono no esta garantizado y el autor remite a repositorios separados.
- Atribucion: aunque la licencia es Apache-2.0, la model card incluye una seccion "License and attribution" que conviene revisar antes de redistribuir.
- Procedencia del ajuste: se desconoce la composicion del dataset de entrenamiento y si hubo filtrado de datos toxicos o de seguridad, lo que limita las garantias para produccion en dominios sensibles.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- Ficheros del repositorio: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF/tree/main
- Modelo base Darwin-36B-Opus: https://huggingface.co/FINAL-Bench/Darwin-36B-Opus
- POCKET-26B-GGUF: https://huggingface.co/FINAL-Bench/POCKET-26B-GGUF
- POCKET-Darwin-180B-GGUF: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- POCKET-KR-GGUF (derivado coreano para telefono): https://huggingface.co/FINAL-Bench/POCKET-KR-GGUF
- POCKET-KR-MLX (derivado coreano para Apple MLX): https://huggingface.co/FINAL-Bench/POCKET-KR-MLX
- POCKET-EN-GGUF (derivado ingles para telefono): https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
- Guia de instalacion del autor: https://vidraft.net/p/pocket.html?model=pocket_35b
- Build de llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md
- Documentacion de carga de modelos en llama.cpp: https://github.com/ggml-org/llama.cpp/blob/master/docs/models.md
- CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub/guides/cli
- Integracion GGUF con Ollama: https://huggingface.co/docs/hub/ollama

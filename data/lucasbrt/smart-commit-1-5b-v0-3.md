# LucasBRT/smart-commit-1.5b-v0.3

## Resumen

smart-commit-1.5b-v0.3 es un modelo de lenguaje especializado en generar mensajes de commit de git, desarrollado por LucasBRT como parte del proyecto smart-commit, una herramienta de línea de comandos que escribe mensajes de commit en el estilo del repositorio usando un modelo pequeño ejecutado localmente. El modelo parte de Qwen2.5-Coder-1.5B-Instruct y está afinado con SFT sobre el dataset CommitChronicle de JetBrains, seguido de una etapa de DPO con muestras generadas por el propio modelo.

La versión 0.3 añade un paso de DPO sobre 5.500 commits no vistos en entrenamiento, donde el modelo muestrea seis respuestas por commit y un conjunto de verificaciones automáticas marca las que copian un asunto reciente, mencionan detalles ausentes en el diff, usan un scope inexistente o un tipo incorrecto de Conventional Commits. El resultado es una reducción drástica de respuestas inválidas: el 99,6 % de las primeras respuestas son utilizables directamente, frente al 84,4 % del modelo base.

Es relevante porque aborda un caso de uso muy concreto (generación de mensajes de commit locales, sin enviar código a APIs externas) con un modelo de solo 1.500 millones de parámetros que cabe en hardware de consumo. La versión sigue siendo experimental, ya que la receta de entrenamiento está aún en evolución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2), afinado con LoRA (SFT + DPO) y pesos fusionados |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); pesos fusionados en bf16 (safetensors) |
| Idiomas soportados | Ingles (mensajes de commit) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 fusionado) y GGUF (Q4_K_M, 986 MB) |

## Arquitectura y entrenamiento

El modelo es un ajuste de Qwen2.5-Coder-1.5B-Instruct, un transformer decoder de 1.500 millones de parametros. El entrenamiento se realizo en dos etapas con LoRA: primero un SFT (heredado de la version 0.1) sobre CommitChronicle, y despues un paso de DPO sobre las salidas del propio modelo. Ambos adaptadores estan disponibles en el directorio `training/` del repositorio, junto con el registro del run de DPO.

El entrenamiento se hizo sobre el prompt exacto de smart-commit (byte a byte, con las reglas completas de `--rules full`), lo que garantiza alineacion total entre modelo y herramienta. Para el DPO se usaron 5.500 commits del train split de CommitChronicle (revision `5fd076e`) ajenos a los datos de v0.1 y a los repositorios de evaluacion: 4.500 de 680 repositorios que siguen Conventional Commits (maximo 8 por repositorio) y 1.000 de repositorios jovenes, con seis muestras por commit generadas a temperatura 0.7 y semillas fijas. Las respuestas elegidas como preferidas son las que superan todas las comprobaciones; las rechazadas son las que copian un asunto reciente, nombran detalles ausentes en el diff, no dicen nada o usan scopes o tipos inexistentes en el repositorio.

## Capacidades

- Generacion de mensajes de commit de git en formato Conventional Commits (tipo, scope y descripcion)
- Generacion de mensajes de commit en estilo libre, adaptandose a repositorios que no siguen Conventional Commits
- Imitacion del estilo historico del repositorio (uso de scopes conocidos, no copia de asuntos recientes)
- Aterrizaje (grounding) en el contenido real del diff, las rutas y el historial: solo el 13,0 % de las palabras de sus respuestas Conventional no aparecen en la informacion proporcionada
- Ejecucion local via llama.cpp en CPU y GPUs Vulkan, sin dependencia de servicios externos
- Formato conversacional (pipeline text-generation), heredado del modelo base instruct

No hay evidencia publicada de soporte de tool calling, agentes, vision ni otros idiomas.

## Casos de uso

- Generacion automatica de mensajes de commit en flujos diarios de desarrollo: integrado en smart-commit, propone un mensaje a partir del diff staged, con un 99,6 % de primeras respuestas utilizables, lo que minimiza reintentos.
- Trabajo offline o en entornos con restricciones de privacidad: al ejecutarse localmente con llama.cpp (CPU o Vulkan), el codigo nunca sale de la maquina, adecuado para empresas con politicas estrictas.
- Normalizacion de Conventional Commits en equipos: el modelo acierta el tipo correcto en el 69,6 % de los casos y usa scopes existentes en el repositorio el 86,8 % de las veces, ayudando a mantener changelogs consistentes.
- Repositorios jovenes con poco historial: en repos con solo 1–5 asuntos previos, consigue un type_match de 0,702 y cero fallbacks en estilo libre, donde otros modelos fallan con mas frecuencia.
- Reduccion de alucinaciones en mensajes de commit: el bajo porcentaje de palabras no fundamentadas (0,020 de respuestas ungrounded frente a 0,144 del modelo base) lo hace adecuado cuando la fidelidad al diff es critica.
- Integracion en scripts y hooks de git: su tamano (986 MB cuantizado) y latencia de modelo pequeño permiten usarlo en pre-commit hooks o pipelines de CI que validen el formato de los mensajes.
- Generacion de datasets sinteticos de commits: dada su baja tasa de respuestas invalidas, puede usarse para generar corpus de mensajes de commit para entrenar o evaluar otros modelos.

## Benchmarks y rendimiento

Evaluacion propia del autor (eval-v1: 500 commits del test split de CommitChronicle, con la lista de archivos anotada que usa smart-commit por defecto; decodificacion greedy, Vulkan, smart-commit 0.9.0):

| Model | type_match | type_macro_f1 | scope_known | first_try | fallback | ungrounded | word_f1 |
|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (control, misma cuantizacion) | 0,436 | 0,190 | 0,604 | 0,844 | 0,056 | 0,144 | 0,249 |
| smart-commit-1.5b-v0.1 | 0,676 | 0,581 | 0,852 | 0,928 | 0,028 | 0,076 | 0,362 |
| smart-commit-1.5b-v0.3 | 0,696 | 0,604 | 0,868 | 0,996 | 0,004 | 0,020 | 0,366 |

Resultados en estilo libre (first_try / word_f1) y en repositorios jovenes (type_match / fallback):

| Model | first_try (free) | word_f1 (free) | type_match (young) | fallback (young) | fallback (young, free) |
|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (control) | 0,848 | 0,141 | 0,149 | 0,043 | 0,060 |
| smart-commit-1.5b-v0.1 | 0,888 | 0,256 | 0,681 | 0,085 | 0,047 |
| smart-commit-1.5b-v0.3 | 0,996 | 0,266 | 0,702 | 0,021 | 0,000 |

Comparacion pareada contra v0.1 (250 commits Conventional de eval-v1, lista anotada): mejoras significativas en `ungrounded` (+0/−14, p = 0,0), `first_copied` (+0/−17, p = 0,0), `first_try` (+17/−0, p = 0,0) y `fallback` (+0/−6, p = 0,031); sin diferencias significativas en `type_match` (p = 0,267) ni `scope_known` (p = 0,289). No se han publicado resultados de benchmarks genericos (MMLU, HumanEval, etc.).

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 986 MB en formato Q4_K_M; aproximadamente 3 GB si se usa el safetensors en bf16
- Cabe con holgura en GPUs de consumo: cualquier GPU con 2 GB de VRAM dedicada via Vulkan (por ejemplo GTX 1650 o superiores), o directamente en CPU
- GPUs recomendadas: cualquier GPU compatible con Vulkan; el autor no reporta requisitos de A100/H100 ni similares
- Ejecucion validada en los dispositivos llama.cpp de smart-commit: CPU y GPUs Vulkan; la exportacion a OpenVINO no esta validada para este modelo
- Opciones de despliegue: llama.cpp (via smart-commit, asignando la variable `SMART_COMMIT_GGUF`); al ser un GGUF estandar, deberia funcionar con otras herramientas compatibles con GGUF, aunque no hay validacion publicada para Ollama, vLLM o TGI
- Latencia y throughput: no disponibles; al ser un modelo de 1.500 millones de parametros cuantizado a 4 bits, se espera latencia baja en hardware de consumo, pero no hay cifras publicadas

## Comparativa con modelos similares

| Modelo | Parametros | Especializacion | first_try (eval propia) | Licencia |
|---|---|---|---|---|
| smart-commit-1.5b-v0.3 | 1.540 M | Mensajes de commit (Conventional y libre) | 0,996 | Apache 2.0 |
| smart-commit-1.5b-v0.1 | 1.540 M | Mensajes de commit | 0,928 | Apache 2.0 |
| Qwen2.5-Coder-1.5B-Instruct (base) | 1.540 M | Codigo general | 0,844 | Qwen Research (uso comercial permitido con condiciones) |

Frente a su modelo base, smart-commit-1.5b-v0.3 casi triplica el type_match (0,696 frente a 0,436) y reduce las respuestas ungrounded de 0,144 a 0,020. No hay comparativas publicadas frente a otros modelos especializados en commit messages de terceros: no disponible.

## Limitaciones y advertencias

- La version 0.3 es explicitamente experimental: la receta de entrenamiento esta cambiando y pueden aparecer regresiones en versiones futuras
- El paso de DPO reduce drasticamente las respuestas invalidas, pero no mejora significativamente el acierto del tipo de commit (type_match), que se queda en torno al 0,70
- El modelo tiende a describir lo que hace el diff en lugar de interpretar el proposito del cambio: usa menos palabras de interpretacion que los commits reales (0,130 frente a 0,327), lo que puede producir mensajes mas literales
- Entrenado y evaluado solo en ingles: el comportamiento con commits en otros idiomas no esta validado
- El word_f1 maximo es 0,366, lo que indica que el solapamiento con el asunto real es limitado; no debe esperarse que reproduzca el mensaje que escribiria el desarrollador
- La exportacion OpenVINO no esta validada
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial
- Riesgo de alucinacion muy reducido pero no nulo (ungrounded de 0,020); en flujos criticos conviene revision humana del mensaje propuesto

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LucasBRT/smart-commit-1.5b-v0.3
- Version anterior (v0.1): https://huggingface.co/LucasBRT/smart-commit-1.5b-v0.1
- Repositorio de smart-commit (CLI): https://github.com/Lucas-BRT/smart-commit
- Documentacion de evaluacion y entrenamiento: https://github.com/Lucas-BRT/smart-commit/blob/main/training/README.md
- Dataset de entrenamiento (CommitChronicle): https://huggingface.co/datasets/JetBrains-Research/commit-chronicle
- Modelo base (Qwen2.5-Coder-1.5B-Instruct): https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct

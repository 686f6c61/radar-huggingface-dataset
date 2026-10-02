# Dennits/Huihui-GLM-5.3-Flash-abliterated-GGUF

## Resumen

Dennits/Huihui-GLM-5.3-Flash-abliterated-GGUF es una version cuantizada en formato GGUF y "abliterated" (sin filtros de rechazo) del modelo zai-org/GLM-5.3-Flash, desarrollado por Z.AI. La abliteracion, en este caso, se ha aplicado unicamente sobre las capas 15 a 35 (indexacion base 0), dejando intactas el resto de capas y todos los modulos de expertos. El resultado es un modelo con la seguridad alineada significativamente reducida, pensado como prueba de concepto experimental.

El modelo tiene aproximadamente 320.760 millones de parametros totales (320,76B) y un tamano de repositorio de 450,8 GB, lo que refleja que el repositorio agrupa varias cuantizaciones GGUF. La arquitectura es un transformer con mezcla de expertos (MoE), segun se deduce de la mencion explicita a "expert modules" en la model card. Soporta modalidad image-text-to-text (entrada de imagen y texto), y sus idiomas declarados son ingles y chino.

Es relevante en el ecosistema open source porque GLM-5.3-Flash es un modelo de codigo ajustado para velocidad que Z.AI ha liberado con pesos abiertos bajo licencia MIT. Esta variante concreta se apoya en las cuantizaciones dinamicas de Unsloth (UD) y en el soporte oficial de llama.cpp para el modelo base. La ficha NO es la del modelo original de Huihui: este repositorio es de un tercero (Dennits) que replica el trabajo publicado por huihui-ai.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); abliteracion aplicada en las capas 15 a 35 |
| Parametros totales | 320.759.404.382 (~320,76 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (valor usado en el ejemplo oficial de llama.cpp con `-c 262144`) |
| Tipos de cuantizacion | GGUF con cuantizacion dinamica de Unsloth (UD); UD-Q4_K_XL confirmado, otros niveles no confirmados |
| Idiomas soportados | ingles (en) y chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

Se trata de un transformer con mezcla de expertos (MoE), dado que la model card distingue entre las capas densas ablacionadas (15 a 35) y los "expert modules" que se mantienen sin ablacionar. No se dispone de informacion sobre el numero de expertos, el numero de parametros activos por token, ni sobre la composicion del dataset de entrenamiento del modelo base. Tampoco hay datos publicos aqui sobre tokens de entrenamiento, fases de RLHF/DPO o tecnicas de atencion lineal.

La innovacion tecnica de esta ficha es la abliteracion selectiva: en lugar de eliminar las direcciones de rechazo en todas las capas, se ha restringido a las capas 15 a 35 con indexacion base 0. La propia model card califica el metodo como una implementacion "cruda" y de prueba de concepto, basada en el proyecto remove-refusals-with-transformers. Las cuantizaciones GGUF proceden del repositorio unsloth/GLM-5.3-Flash-GGUF, e incluyen el tag `imatrix`. El modelo base GLM-5.3-Flash esta descrito por terceros como un modelo de codigo "speed-tuned" de Z.AI, y el soporte para su arquitectura (glm5_next) ya esta integrado en llama.cpp.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Procesamiento multimodal image-text-to-text: acepta imagenes junto a texto como entrada.
- Generacion de codigo, dado que el modelo base (GLM-5.3-Flash) esta orientado a tareas de programacion y ajustado para velocidad.
- Razonamiento y matematicas: no confirmado explicitamente en la informacion disponible.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado en la informacion disponible.
- Capacidades multilingues limitadas a ingles y chino (marcados en la model card).
- Capacidad especial: filtrado de seguridad reducido por abliteracion (produce contenido que un modelo alineado rechazaria).

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo sirve como sujeto de estudio para medir como cambia el comportamiento de un MoE de 320B al eliminar las direcciones de rechazo solo en un subconjunto de capas.
- Analisis de robustez de filtros de seguridad: util para evaluar hasta que punto la ablacion parcial de capas compromete las barreras de seguridad del modelo base.
- Generacion de codigo en entornos controlados: al heredar la orientacion a programacion del modelo base, puede usarse en tareas de autocompletado y refactorizacion dentro de sandboxes aislados, sin exposicion a produccion.
- Procesamiento de documentos con imagenes en ingles o chino: el pipeline image-text-to-text permite extraer y resumir informacion de capturas, diagramas o formularios, aunque sin garantias de seguridad en las respuestas.
- Experimentacion con cuantizacion dinamica Unsloth: sirve para comparar la calidad de UD-Q4_K_XL frente a otros niveles en un modelo de 320B y validar el soporte glm5_next de llama.cpp.
- Red teaming interno: equipo de seguridad que genera prompts adversarios para estudiar los modos de fallo del modelo sin filtros antes de decidir politicas de despliegue.
- Fine-tuning posterior sobre dominio especifico: al estar bajo licencia MIT y en GGUF, puede servir de base para ajustes experimentales, siempre que se asuman las advertencias de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 320,76B parametros; cifras orientativas, no confirmadas por el autor):
  - UD-Q4_K_XL: en torno a 180-200 GB.
  - Cuantizaciones de 8 bits: en torno a 340 GB.
  - Precisión completa (16 bits): en torno a 640 GB.
- GPU recomendadas: configuraciones multi-GPU de clase profesional. El autor de huihui-ai reporta 2x RTX 6000 Pro ejecutando UD-Q4_K_XL a unos 20 t/s.
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) ni con cuantizaciones de 4 bits.
- Opciones de despliegue: llama.cpp, en concreto la rama unslothai (glm5next/upstream), con el comando de ejemplo `llama-cli -m .../UD-Q4_K_XL/GLM-5.3-Flash-UD-Q4_K_XL-00001-of-00006.gguf -c 262144`. Otros motores (vLLM, TGI, Ollama) no estan confirmados en la informacion disponible.
- Latencia y throughput: aproximadamente 20 t/s sobre 2x RTX 6000 Pro con la cuantizacion UD-Q4_K_XL (dato publicado por huihui.ai en X).

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dennits/Huihui-GLM-5.3-Flash-abliterated-GGUF | ~320,76B | 262.144 tokens (segun ejemplo) | MIT | GGUF | Abliteracion parcial (capas 15-35), replica de terceros |
| huihui-ai/GLM-5.3-Flash-abliterated-GGUF | ~320,76B | no disponible | MIT | GGUF | Repositorio original de la abliteracion de Huihui |
| zai-org/GLM-5.3-Flash | no disponible | no disponible | no disponible | safetensors | Modelo base alineado, sin abliterar |
| unsloth/GLM-5.3-Flash-GGUF | ~320,76B | no disponible | no disponible | GGUF | Fuente de las cuantizaciones, sin abliterar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Filtrado de seguridad muy reducido: puede generar contenido sensible, controvertido o inapropiado. El autor desaconseja su uso en produccion o en aplicaciones comerciales de cara al publico.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la ausencia de benchmarks publicados.
- Adecuado solo para investigacion, pruebas o entornos controlados; no apto para menores ni para aplicaciones con requisitos de seguridad altos.
- La licencia del repositorio es MIT, pero el uso comercial queda fuertemente desaconsejado por el propio autor por motivos legales y eticos; el usuario asume toda la responsabilidad.
- Cobertura idiomatica limitada a ingles y chino; el castellano no esta soportado oficialmente.
- Al ser una implementacion "cruda" y de prueba de concepto, la ablacion parcial de capas (solo 15 a 35) puede producir comportamientos inconsistentes: rechazos residuales en unas areas y salidas descontroladas en otras.
- Sin garantias de seguridad por parte de huihui.ai ni del autor del repositorio.
- El autor del repositorio (Dennits) no es el autor original de la abliteracion; conviene verificar la cadena de procedencia frente al repositorio de huihui-ai.
- Descargas y likes a cero en el momento de la consulta: no hay validacion comunitaria que respalde la calidad del artefacto.

## Enlaces

- Repositorio de la ficha: https://huggingface.co/Dennits/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Repositorio original de la version abliterated: https://huggingface.co/huihui-ai/GLM-5.3-Flash-abliterated-GGUF
- Repositorio GGUF de la version abliterated de Huihui: https://huggingface.co/huihui-ai/Huihui-GLM-5.3-Flash-abliterated-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Cuantizaciones GGUF de origen: https://huggingface.co/unsloth/GLM-5.3-Flash-GGUF
- Proyecto de abliteracion: https://github.com/Sumandora/remove-refusals-with-transformers
- Rama de llama.cpp con soporte glm5next: https://github.com/unslothai/llama.cpp/tree/glm5next/upstream
- Releases de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
- Cliente de escritorio de terceros para GLM-5.3-Flash: https://github.com/glm-5-3-flash/glm-5.3-flash
- Publicacion de huihui.ai con el dato de throughput: https://x.com/support_huihui/status/2103803831939486050
- Hilo divulgativo sobre la publicacion: https://x.com/danNH2006/status/2103795603298038099
- Donaciones del autor original: https://ko-fi.com/huihuiai

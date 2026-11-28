# mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf

## Resumen

kanana-1.5-2.1b-diary-dpo-gguf es un modelo de lenguaje de 2.100 millones de parametros (2.086.984.704 exactos) publicado por el usuario mrtint0729 bajo el proyecto Alpharium/Pocketlog. Se trata de un ajuste fino del modelo base kakaocorp/kanana-1.5-2.1b-instruct-2505 de Kakao Corp, especializado en la generacion de entradas de diario en coreano para despliegue on-device. El modelo se distribuye exclusivamente en formato GGUF cuantizado para su uso con llama.cpp.

El modelo resuelve un problema muy concreto: la generacion automatica de texto diaristico en coreano con longitud variable en un unico turno, pensado para ejecutarse en dispositivos con recursos limitados. La version actual, etiquetada como model-v2.0.0, incorpora un entrenamiento SFT que combina descripciones de imagenes generadas por un VLM en coreano con una seleccion de datos tipo "select4" y una estrategia de longitud adaptativa. El archivo principal pesa 1.241.435.488 bytes (aproximadamente 1,156 GiB), lo que lo hace viable en hardware de consumo.

Su relevancia radica en su caracter de liberacion de nicho: un modelo pequeno, cuantizado, con licencia Apache-2.0 heredada del modelo base, optimizado para una tarea especifica y con metadatos de ejecucion detallados (parametros de muestreo, gramatica restringida y opciones de runtime). No es un modelo de proposito general, sino una pieza de un pipeline de aplicacion concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: kanana-1.5-2.1b-instruct-2505) |
| Parametros totales | 2.086.984.704 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 2048 tokens (n_ctx recomendado en la model card) |
| Tipos de cuantizacion | GGUF cuantizado (archivo de 1.156 GiB); nivel de cuantizacion exacto no disponible |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base kanana-1.5-2.1b-instruct-2505 (tipo de transformer, atencion, etc.). Lo que si se documenta es el proceso de ajuste: el modelo parte del instruct de Kakao y se somete a un entrenamiento SFT documentado en el experimento EXP-027, cuyo identificador interno es "adaptive-length-ko-vlm-sft-v5-3". Este entrenamiento combina captions de imagenes generadas por un VLM en coreano, una seleccion de datos denominada "select4" y una estrategia de generacion de longitud variable en un solo turno.

El repositorio incluye tambien la etiqueta "dpo" en el nombre, lo que sugiere una fase de optimizacion por preferencias directas, aunque la model card no detalla hiperparametros, numero de tokens de entrenamiento, composicion exacta del dataset ni si hubo RLHF adicional. La version de pesos publicada bajo el tag model-v2.0.0 corresponde al archivo pocketlog-diary-v2.0.0.gguf, con MD5 1a5ef8e020a3347d210144438fb673aa.

## Capacidades

- Generacion de texto en coreano para entradas de diario con longitud variable en un unico turno.
- Generacion condicionada por descripciones de imagenes (captions de VLM en coreano) segun el proceso de entrenamiento documentado.
- Conversacion de un solo turno (conversational) segun los tags del repositorio.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Ejecucion on-device mediante llama.cpp.
- Soporte de gramatica restringida: la model card especifica `root ::= [^A-Za-z]*`, lo que restringe la salida a caracteres no latinos (util para forzar texto coreano).
- No se documentan capacidades de tool calling, function calling, agentes, vision nativa, audio ni modo de razonamiento explicito.

## Casos de uso

- Aplicacion de diario personal on-device: el modelo genera entradas de diario en coreano a partir de la actividad del usuario, ejecutandose localmente en el dispositivo con llama.cpp y un contexto de 2048 tokens, sin enviar datos a la nube.
- Diario a partir de fotos: dado que el entrenamiento SFT incorpora captions de VLM en coreano, el modelo puede transformar la descripcion de una imagen en una entrada de diario coherente, integrándose en un pipeline donde un VLM local genera el caption y este modelo lo redacta.
- Resumenes diarios con longitud adaptativa: la estrategia de longitud variable permite generar entradas cortas o largas segun el contenido disponible, util para aplicaciones que adaptan el texto al espacio de pantalla o al nivel de detalle del dia.
- Prototipado rapido de funciones de escritura asistida en coreano: el tamano de 2.1B y el formato GGUF permiten iterar en portatiles sin GPU dedicada, con latencia aceptable para generacion de hasta 512 tokens (n_predict=512).
- Integracion en aplicaciones moviles o de escritorio con privacidad estricta: al ejecutarse on-device con pesos Apache-2.0, encaja en productos que no pueden depender de APIs externas por requisitos de residencia de datos.
- Filtrado de salida no latina en produccion: la gramatica `root ::= [^A-Za-z]*` permite garantizar que la salida sea exclusivamente coreana, util para evitar contaminacion con texto en otros alfabetos en aplicaciones de escritura.
- Base para experimentacion con DPO en dominio diario: al estar construido sobre un instruct de Kakao y entrenado con SFT/DPO, sirve como punto de partida para ajustes adicionales en generacion de texto personal en coreano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF pesa 1.156 GiB, por lo que la inferencia requiere aproximadamente 1,2-1,5 GB de memoria para los pesos, mas el espacio de contexto (n_ctx=2048) y overhead del runtime.
- GPU recomendadas: no se especifican en la model card. Por tamano, cualquier GPU con al menos 2-3 GB de VRAM libre es suficiente; una RTX 3060, RTX 4060 o superiores ofrecen margen holgado.
- Cabe en GPU de consumo: si, con amplio margen en tarjetas de 4 GB o mas; tambien es viable en CPU.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), con soporte de flash attention (`-fa on`) segun la model card. No se documentan otros runtimes (vLLM, TGI, Ollama) en la informacion disponible.
- Latencia y throughput: no disponibles. La model card recomienda temperature=0.60, top_p=0.90, top_k=40 y n_predict=512 para el muestreo.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo en la informacion proporcionada. A continuacion se comparan caracteristicas objetivas con el modelo base y una alternativa de tamano similar, sin datos de benchmarks:

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| kanana-1.5-2.1b-diary-dpo-gguf | 2.100 M | 2048 | ko | Apache-2.0 | GGUF |
| kakaocorp/kanana-1.5-2.1b-instruct-2505 | no disponible | no disponible | no disponible | Apache-2.0 | safetensors (modelo base) |
| Alternativas de ~2B para coreano on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo de nicho: entrenado especificamente para generacion de diario en coreano; su rendimiento fuera de ese dominio no esta documentado y probablemente sea limitado.
- Monolingue: solo soporta coreano (ko); no se garantiza calidad en otros idiomas.
- Contexto corto: 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinacion: como todo modelo generativo de 2.1B, puede inventar detalles; no se documentan mitigaciones especificas.
- Sesgos: no se documenta ninguna evaluacion de sesgos ni de seguridad en la model card.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero se hereda del modelo base de Kakao Corp; conviene verificar los terminos del modelo base original.
- Dependencia del runtime: el uso esta pensado para llama.cpp con opciones concretas (flash_attn, gramatica); otros runtimes no estan validados.
- Versionado: el repositorio usa tags de version (model-v2.0.0); conviene fijar la URL de resolucion con tag para reproducibilidad, ya que el contenido puede cambiar entre versiones.
- Cuantizacion no especificada: la model card no indica el nivel exacto de cuantizacion (Q4_K_M, Q5, etc.), lo que dificulta estimar la perdida de calidad respecto al modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf
- Archivo versionado v2.0.0: https://huggingface.co/mrtint0729/kanana-1.5-2.1b-diary-dpo-gguf/resolve/model-v2.0.0/pocketlog-diary-v2.0.0.gguf
- Modelo base: https://huggingface.co/kakaocorp/kanana-1.5-2.1b-instruct-2505

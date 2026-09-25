# SceneWorks/xcodec-mini-infer

## Resumen

SceneWorks/xcodec-mini-infer es una redistribucion en formato safetensors del codec de audio `xcodec` publicado originalmente por el equipo M-A-P y la HKUST dentro del proyecto YuE. No se trata de un modelo de lenguaje generativo, sino del componente acustico del pipeline de generacion de canciones a partir de letras (lyrics2song): convierte audio en tokens discretos y los reconstruye de vuelta a onda de audio a 44,1 kHz. El repositorio lo publica SceneWorks para su motor de inferencia en Rust (candle) del sistema YuE.

El paquete incluye cuatro ficheros de pesos en float32: el codec principal (`final_ckpt/ckpt_00360000.safetensors`, 530 tensores), dos vocoders Vocos a 44,1 kHz para las ramas vocal (`decoder_131000`) e instrumental (`decoder_151000`), y el checkpoint de la rama semantica HuBERT (`semantic_ckpts/hf_1_325000/model.safetensors`, 211 tensores). Ademas se copian los ficheros de configuracion YAML y los ficheros del tokenizador multimodal de YuE (`mm_tokenizer_v0.2_hf`).

Su relevancia es practica: permite desplegar la parte acustica de YuE sin depender de los ficheros pickle originales ni de codigo Python, algo util para integraciones en aplicaciones nativas de escritorio. Es un espejo no oficial, con licencia Apache-2.0, y esta pensado para emparejarse con los modelos de lenguaje de la familia `yue-s1-7b` tambien publicados por SceneWorks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec neuronal de audio: SoundStream/SEANet + RVQ (residual vector quantization) + rama semantica HuBERT, con dos vocoders Vocos a 44,1 kHz |
| Parametros totales | no disponible (el repo contiene 903 tensores en float32: 530 + 81 + 81 + 211) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (codec de audio; la ventana util depende del segmento de audio de entrada, no de un contexto de tokens de texto) |
| Tipos de cuantizacion | no aplica en este repo: todos los ficheros se distribuyen en float32 sin tierizar (las variantes bf16/q8/q4 afectan solo al LM de YuE, que reutiliza estos mismos ficheros a precision original) |
| Idiomas soportados | no disponible a nivel de codec; los tags incluyen `yue` (proyecto YuE). El tratamiento multilingue de las letras corresponde al LM, no al codec |
| Licencia | Apache-2.0, copyright 2025 de Ruibin Yuan y contribuyentes principales de M-A-P y HKUST; se conserva LICENSE y NOTICE conforme a la seccion 4(d) |
| Formato de pesos | safetensors (float32) |
| Tamano del repositorio | 1,3 GB |
| Frecuencia de muestreo de salida | 44,1 kHz (vocoders Vocos) |
| Revision upstream | `m-a-p/xcodec_mini_infer` en la revision `fe781a67815ab47b4a3a5fce1e8d0a692da7e4e5` |
| Componentes incluidos | `final_ckpt/ckpt_00360000.safetensors`, `decoders/decoder_131000.safetensors`, `decoders/decoder_151000.safetensors`, `semantic_ckpts/hf_1_325000/model.safetensors`, configs YAML, `HuBERT config.json`/`preprocessor_config.json` y `mm_tokenizer_v0.2_hf/tokenizer.model` |

## Arquitectura y entrenamiento

La arquitectura es la del codec `xcodec` de YuE: un encoder/decoder tipo SoundStream con bloques SEANet, cuantizacion vectorial residual (RVQ) para producir tokens discretos y una rama semantica basada en HuBERT que aporta representaciones de contenido linguistico/fonetico. El repositorio incluye ademas dos vocoders Vocos independientes que operan a 44,1 kHz, uno orientado a la senal vocal (`decoder_131000`) y otro a la instrumental (`decoder_151000`), lo que permite reconstruir mezclas con separacion de ramas.

Sobre el entrenamiento no se aportan detalles en la informacion disponible: no se indica el volumen de horas de audio, la composicion del dataset ni si hubo etapas de ajuste con preferencias humanas o RLHF (en un codec de audio estos terminos no aplican del mismo modo que en un LM). Lo unico documentado son los pasos de checkpoint: `ckpt_00360000` para el codec, `decoder_131000` y `decoder_151000` para los vocoders y `hf_1_325000` para la rama semantica HuBERT. La conversion a safetensors es fiel: cada tensor es igual en valor, dtype y forma al pickle original, y del checkpoint principal solo se conserva el `state_dict` de `codec_model`, descartando el optimizador, el planificador de learning rate y el discriminador (`mfd`) usados solo en entrenamiento. No se redistribuye codigo Python del repositorio de origen.

## Capacidades

- Codificacion de audio a tokens discretos mediante RVQ (representacion comprimida apta para modelado autorregresivo).
- Decodificacion de tokens discretos a forma de onda a 44,1 kHz mediante los vocoders Vocos incluidos.
- Rama semantica HuBERT separada, util para condicionamiento y para representaciones de contenido independientes del timbre.
- Reconstruccion diferenciada de vocal e instrumental gracias a los dos decoders especificos.
- Integracion con el tokenizador multimodal de YuE (`mm_tokenizer_v0.2_hf`), necesario para el pipeline completo de lyrics2song.
- Ejecucion dentro del motor de inferencia de SceneWorks basado en candle, sin Python, sin Docker y sin servicios en la nube.
- Generacion de texto, razonamiento, codigo, vision, tool calling, function calling y uso como agente: no aplica, es un codec de audio y no un modelo de lenguaje.
- Capacidad multilingue: no disponible; el codec es agnostico al idioma de la letra, que se procesa en el LM asociado.

## Casos de uso

- Pipeline completo de lyrics2song con YuE: el codec actua como etapa final que convierte los tokens generados por el LM en audio a 44,1 kHz. Es imprescindible emparejarlo con un modelo de la familia `yue-s1-7b` para obtener una cancion.
- Despliegue local en escritorio: al estar en safetensors y disenado para el motor candle de SceneWorks, permite ejecutar la sintesis de audio en la GPU del usuario en Windows y Linux (CUDA) sin instalar Python ni contenedores.
- Investigacion en representaciones discretas de audio: la separacion entre rama acustica RVQ y rama semantica HuBERT facilita experimentos sobre que informacion codifica cada nivel del codec.
- Ajuste fino de modelos de musica: los tokens discretos de xcodec se pueden usar como vocabulario objetivo para entrenar o adaptar LMs de generacion musical (por ejemplo, dominios o idiomas concretos como el japones o el coreano, como hace la variante `yue-s1-7b-anneal-jp-kr-icl-candle`).
- Separacion y re-sintesis de stems: usar `decoder_131000` y `decoder_151000` por separado permite reconstruir voz e instrumental de forma independiente para post-produccion o karaoke.
- Vocodificacion de alta fidelidad en produccion musical asistida: reconstruir mezclas a 44,1 kHz a partir de latentes es util en herramientas de edicion que operan en el dominio de tokens en lugar del dominio de onda.
- Verificacion de fidelidad de la redistribucion: dado que cada tensor es igual al original, sirve como referencia para validar conversiones propias o para auditar la cadena de custodia de pesos en entornos sin soporte de pickle.
- Aplicaciones de privacidad estricta: al no requerir nube ni enviar audio a terceros, encaja en flujos donde el material musical no puede salir de la estacion de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas objetivas (por ejemplo, PESQ, ViSQOL, MUSHRA o tasas de error de tokens) ni comparaciones cuantitativas con otros codecs.

## Requisitos de hardware

- VRAM estimada para los pesos: en torno a 1,3 GB en float32 para el conjunto de los cuatro ficheros (dato derivado del tamano del repositorio); a ello hay que sumar activaciones y buffers del decoder, por lo que el uso real es superior.
- El coste dominante en un pipeline YuE completo no es este codec, sino el LM de ~7B que lo acompana; el codec anade una fraccion pequena del total.
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas de VRAM es suficiente para la parte de codec (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090). Para lotes grandes o sintesis por lotes en servidor, A100 o H100 reducen los tiempos de decodificacion.
- Cabe en GPU consumer: si, el codec por si solo es ligero; la viabilidad depende del LM asociado.
- Opciones de despliegue: el motor candle de SceneWorks (macOS con MLX para el resto del estudio, CUDA en Windows/Linux). Este repositorio no incluye codigo Python, por lo que vLLM, TGI, llama.cpp u Ollama no son aplicables directamente: son runners de modelos de lenguaje y no de vocoders. Para usarlo fuera de SceneWorks hay que recurrir al repositorio original `m-a-p/xcodec_mini_infer`, que si aporta el codigo de inferencia.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Salida | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| SceneWorks/xcodec-mini-infer | Codec de audio + vocoders Vocos | no disponible (903 tensores, float32) | 44,1 kHz | Apache-2.0 | HuggingFace, safetensors | Espejo no oficial, sin codigo Python |
| m-a-p/xcodec_mini_infer | Codec de audio + vocoders Vocos | mismos pesos que el anterior | 44,1 kHz | Apache-2.0 (segun el espejo) | HuggingFace y ModelScope | Distribucion original, incluye codigo de inferencia y ficheros en formato pickle |
| EnCodec (Meta) | Codec neuronal con RVQ | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | Vecino de categoria; no se han recuperado datos en la busqueda |
| DAC (Descript) | Codec neuronal con RVQ | no disponible en la informacion proporcionada | no disponible | no disponible en la informacion proporcionada | no disponible | Vecino de categoria; no se han recuperado datos en la busqueda |

No se dispone de comparaciones de calidad objetiva entre estos modelos dentro de la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: sin un LM de YuE que produzca los tokens, no genera musica. No acepta texto ni instrucciones.
- Redistribucion no oficial: el propio autor indica explicitamente que no es una distribucion oficial de M-A-P. Para citas academicas o uso de referencia conviene remitirse al repositorio original.
- Ausencia de codigo de inferencia: el repositorio no incluye codigo Python; solo pesos, configuraciones y tokenizador. La integracion fuera de SceneWorks exige implementar o reutilizar el codigo upstream.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad de reconstruccion, robustez con generos musicales distintos ni comportamiento con entradas fuera de distribucion.
- Sesgos y cobertura de dominio: no disponible. Al no documentarse la composicion del dataset de entrenamiento, se desconoce la representacion de generos, idiomas, instrumentos o estilos poco frecuentes.
- Riesgo de artefactos de audio: como todo codec con cuantizacion vectorial residual, puede introducir perdida de detalle en agudos, transitorios o voces con tecnicas extendidas. No se han publicado mediciones al respecto en esta informacion.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero obliga a conservar LICENSE y NOTICE conforme a la seccion 4(d). El copyright de los pesos corresponde a Ruibin Yuan y contribuyentes de M-A-P y HKUST (2025).
- Ruptura de precision: al distribuirse unicamente en float32 y sin tierizar, no se ofrece una ruta de cuantizacion propia; cualquier conversion a bf16 o int8 corre por cuenta de quien la realice y puede degradar la reconstruccion.
- Inconsistencia de metadatos: las fechas del repositorio (creacion y actualizacion el 2026-09-24) no concuerdan con el ano de copyright indicado en la licencia (2025); conviene verificar la revision efectiva antes de fijar una dependencia.
- Frecuencia de muestreo fija a 44,1 kHz: entradas o salidas a otras tasas requieren remuestreo externo.

## Enlaces

- HuggingFace (este repositorio): https://huggingface.co/SceneWorks/xcodec-mini-infer
- Repositorio upstream en HuggingFace: https://huggingface.co/m-a-p/xcodec_mini_infer
- README upstream: https://huggingface.co/m-a-p/xcodec_mini_infer/blob/main/README.md
- Espejo en ModelScope: https://www.modelscope.cn/models/m-a-p/xcodec_mini_infer
- GitHub de SceneWorks: https://github.com/SceneWorks/SceneWorks
- Modelo de lenguaje asociado: https://huggingface.co/SceneWorks/yue-s1-7b-anneal-jp-kr-icl-candle

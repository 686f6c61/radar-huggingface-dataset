# ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2

## Resumen

Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2 es una distribucion cuantizada en 8 bits del modelo multimodal Ornith 1.5, empaquetada junto con su modelo borrador (draft model) DFlash2 para decodificacion especulativa sobre Apple Silicon. Lo publica el usuario ahmedihamdy en Hugging Face y esta construido sobre la arquitectura Qwen3.5 MoE (tag `qwen3_5_moe`), con 35.107.180.016 parametros totales y aproximadamente 3B parametros activos por token al activar 8 de sus 256 expertos. Incluye la torre de vision original en bf16 (27 bloques, 447M parametros) y pesos de texto en 8 bits.

El modelo resuelve el problema de ejecutar un LLM multimodal de gran tamano de forma local y privada en un Mac, combinando cuantizacion de 8 bits, decodificacion especulativa con arbol de borradores (draft-tree) y un contexto declarado de hasta 262.144 tokens. La innovacion principal es el empaquetado del drafter dentro del propio repositorio (carpeta `drafter`), de modo que la app Astronomical lo detecta y activa automaticamente al cargar el modelo.

Es relevante para desarrolladores que quieren inferencia local con vision, razonamiento y tool calling sin enviar datos a la nube, y que disponen de hardware Apple con memoria unificada suficiente. El repositorio ocupa 38,8 GB y la licencia es dual MIT y Apache 2.0, con un fichero NOTICE que detalla las condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Qwen3.5 MoE) con torre de vision |
| Parametros totales | 35.107.180.016 (35B) |
| Parametros activos | Aproximadamente 3B (8 de 256 expertos por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 8 bits para pesos de texto y expertos; bf16 para la torre de vision |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT y Apache 2.0 (fichero NOTICE) |
| Formato de pesos | safetensors (libreria mlx) |
| Tamano del repositorio | 38,8 GB |
| Torre de vision | 27 bloques, 447M parametros, bf16 |
| Decodificacion especulativa | DFlash2 con arbol de borradores, 3 tokens propuestos por ronda |
| Plataforma objetivo | Apple Silicon (MLX), macOS 14 o posterior |

## Arquitectura y entrenamiento

El modelo es una mezcla de expertos (MoE) de tipo transformer con 35B parametros totales y enrutamiento que activa 8 de 256 expertos por token, lo que resulta en unos 3B parametros efectivos por paso. Incorpora una torre de vision de 27 bloques y 447M parametros en precision bf16 completa, acoplada a los pesos de texto en 8 bits. Segun la model card, los pesos publicados son los originales de Ornith sin recuantizar ni reentrenar: cada fichero de pesos es identico al de su revision fuente y se registra el SHA-256 de cada uno en `astronomical-build.json`. Se verifico la coherencia entre torre y pesos de texto comprobando que 24 de 24 tensores de texto muestreados coinciden con la base y que la anchura de la torre y los tokens de imagen son correctos.

La innovacion tecnica destacable es la decodificacion especulativa DFlash2 con estructura de arbol: en cada ronda el drafter propone 3 tokens mas alla del actual, profundizando donde tiene confianza y ramificando alternativas donde no la tiene. El modelo grande verifica las 4 filas del arbol en un solo paso y conserva cada token que acepta mas uno propio, produciendo hasta 4 tokens por ronda. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento previo a la respuesta (modo de razonamiento explicito).
- Comprension de imagenes y texto (pipeline `image-text-to-text`), con la torre de vision original.
- Llamada a herramientas (tool calling) segun la model card.
- Ejecucion como agente de codificacion mediante `astronomical launch claude`, `codex` u `opencode`.
- Conversacion multiturno con ventana de hasta 262.144 tokens.
- Compatibilidad con la API local de estilo OpenAI y Anthropic para integracion con clientes externos.
- Decodificacion especulativa automatica cuando el modelo y su drafter caben en memoria.
- Soporte unicamente de ingles como idioma declarado.

## Casos de uso

- Asistente de codigo local en Mac: se lanza con `astronomical launch claude --model Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2` para tener un agente de programacion que no envia codigo a la nube, aprovechando el tool calling y el contexto largo para trabajar sobre repositorios completos.
- Analisis de documentos e imagenes tecnicas: el modelo acepta imagenes junto a texto (`--image photo.png`) y puede describir o razonar sobre capturas, diagramas o fotografias sin salir del equipo.
- Atencion al cliente con privacidad estricta: conversaciones multiturno largas gracias a los 262.144 tokens de contexto, ejecutadas en local para cumplir requisitos de confidencialidad.
- Procesamiento por lotes de imagenes y texto en pipelines internos: se expone via API local compatible con OpenAI o Anthropic y se integra en scripts existentes.
- Prototipado de agentes multi-paso: el modelo razona antes de responder y puede encadenar llamadas a herramientas para tareas de automatizacion.
- Investigacion sobre decodificacion especulativa: el repositorio incluye el drafter DFlash2 y el arbol de borradores, lo que permite estudiar el impacto del drafting en latencia sobre hardware Apple.
- Uso educativo y experimentacion con MoE multimodal: util para analizar el comportamiento de un MoE de 35B con 3B activos en entornos de memoria unificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta datos operativos: se requieren unos 36 GB de disco y aproximadamente 37 GB de memoria de modelo para velocidad completa, lo que en la practica implica un Mac con 64 GB o mas. La decodificacion especulativa solo se activa si el modelo completo y el drafter caben en memoria; en Macs sin GPU de la familia M5 o con menor limite de memoria el modelo sigue funcionando pero decodifica un token por vez. Los kernels de drafting usan las unidades matriciales de la GPU M5 para acelerar.

## Requisitos de hardware

- Disco: aproximadamente 36 GB de descarga (repositorio de 38,8 GB).
- Memoria para velocidad completa: aproximadamente 37 GB de memoria de modelo, configurable como "Maximum model RAM" en Astronomical; en la practica un Mac con 64 GB o mas.
- GPU recomendada: Apple Silicon de la familia M5 para aprovechar los kernels de drafting; en otras GPU Apple el modelo funciona sin drafting.
- No esta pensado para GPU NVIDIA (A100, H100, RTX 4090): el formato es MLX y la plataforma objetivo es Apple Silicon.
- Opciones de despliegue: app Astronomical (macOS 14 o posterior), CLI `astronomical` y API local compatible con OpenAI y Anthropic.
- Con memoria insuficiente, Astronomical mantiene parte de los expertos en SSD y los lee bajo demanda, lo que reduce la velocidad pero permite ejecutar el modelo en Macs con menos memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2 | 35B | ~3B | 262.144 | Si | MIT y Apache 2.0 | safetensors MLX 8 bits |
| Ornith-1.5-35B-A3B-MLX-8bit-vision | 35B | ~3B | 262.144 | Si | MIT y Apache 2.0 | safetensors MLX 8 bits |
| Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit | 35B | ~3B | 262.144 | Si | no disponible | MLX 4 bits |
| Ornith-1.5-35B-A3B-DFlash2 | 35B | ~3B | no disponible | no disponible | no disponible | safetensors |

La diferencia principal frente a la variante sin DFLASH2 es la inclusion del drafter y la decodificacion especulativa; frente a la variante OptiQ 4 bits, el modelo aqui descrito ocupa aproximadamente 13 GB mas pero conserva mayor precision en los pesos.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de fiabilidad.
- La decodificacion especulativa requiere que modelo y drafter queden en memoria; por debajo de ese umbral se pierde la aceleracion.
- El rendimiento optimo depende de GPU Apple M5; en otras generaciones el drafting no aporta la misma ventaja.
- No es ejecutable en GPU NVIDIA ni en entornos CUDA; esta atado a MLX y Apple Silicon.
- La licencia es dual MIT y Apache 2.0 con un fichero NOTICE que debe revisarse antes de uso comercial; el campo `license: other` en los metadatos exige consultar dicho NOTICE.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria independiente.
- No se dispone de informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- El modelo base declarado es de un autor tercero (ahmedihamdy y jzinno), no del desarrollador original de Ornith; conviene verificar la procedencia de los pesos.

## Enlaces

- Hugging Face: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2
- Modelo base: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision
- Modelo borrador DFlash2: https://huggingface.co/jzinno/Ornith-1.5-35B-A3B-DFlash2
- Variante OptiQ 4 bits: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-OptiQ-DFLASH2-4bit
- Fichero NOTICE de licencia: https://huggingface.co/ahmedihamdy/Ornith-1.5-35B-A3B-MLX-8bit-vision-DFLASH2/blob/main/NOTICE
- App Astronomical: https://getastronomical.com/
- Descarga de Astronomical: https://github.com/aosama/astronomical/releases/latest
- Documentacion de API local: https://getastronomical.com/local-api.html

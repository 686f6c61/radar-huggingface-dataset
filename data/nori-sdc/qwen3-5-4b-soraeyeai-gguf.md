# nori-sdc/Qwen3.5-4B-SoraEyeAI-GGUF

## Resumen

Qwen3.5-4B-SoraEyeAI-GGUF es un ajuste fino (fine-tuning) del modelo vision-lenguaje Qwen3.5-4B de Alibaba Cloud, desarrollado por la empresa japonesa 株式会社ソフトウエア開発 (Software Development Co., Ltd., con sede en Sendai). El modelo ha sido especializado para describir en japones breve el entorno de un peatón a partir de fotografias tomadas con el iPhone, y constituye el motor de percepcion de la aplicacion SoraEyeAI, una app de asistencia a personas con discapacidad visual publicada gratuitamente en la App Store japonesa.

El modelo resuelve un problema muy concreto: ofrecer a personas ciegas o con baja vision una descripcion verbal del entorno inmediato (cruces, pavimento tactil, vallas de obra, personas, escaparates) sin enviar las imagenes fuera del dispositivo. Para ello se parte de una arquitectura multimodal de 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y se ajusta unicamente la torre de lenguaje mediante LoRA, manteniendo congeladas las capas de vision y el proyector multimodal original.

La relevancia actual del modelo reside en su enfoque de privacidad y ejecucion local: se distribuye en formato GGUF Q6_K (3,46 GB) junto con el proyector `mmproj-F16.gguf` (672 MB), lo que permite inferencia en un iPhone 15 Pro o posterior con unos 8 GB de memoria y 5 GB de almacenamiento libre. La licencia Apache 2.0 facilita su reutilizacion y auditoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje (base Qwen3.5-4B); ajuste LoRA solo en capas de lenguaje, vision congelada |
| Parametros totales | 4.205.751.296 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q6_K (pesos del modelo); proyector multimodal en F16 (`mmproj-F16.gguf`) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura multimodal de Qwen3.5-4B, compuesta por una torre de vision y un proyector que alimentan una torre de lenguaje transformer. El ajuste fino se realizo mediante LoRA aplicado exclusivamente a las capas de lenguaje, dejando congeladas las capas de vision y el proyector multimodal; posteriormente los adaptadores se fusionaron en los pesos base. El proyector distribuido (`mmproj-F16.gguf`) es una copia sin modificar del original de `unsloth/Qwen3.5-4B-GGUF`, con SHA-256 identico, lo que garantiza que la percepcion visual corresponde al modelo upstream.

El entrenamiento se ha iterado en cuatro versiones (v1, v2, v3 y v3.1). La v1 cubria cruces, lentes cubiertas y vallas de obra; la v2 anadio descripciones mas largas (unas 120 letras japonesas) para cuando el usuario se detiene, incluyendo nombres de comercios y edificios cuando el rotulo los hace claramente legibles; la v3 enseno al modelo a no confundir tapas metalicas de alcantarilla (rejillas) con pavimento tactil; y la v3.1 amplio el conjunto con fotos de alcantarillas de la ruta habitual del desarrollador (con variacion de redaccion y luz de tarde) y con imagenes editadas para eliminar postes electricos. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

Una decision de diseno destacable es la exclusion deliberada de frases que afirmen seguridad («puede cruzar», «no hay coches») del material de entrenamiento, de modo que el modelo solo enuncie hechos observados y no emita juicios de seguridad.

## Capacidades

- Descripcion de imagenes en japones breve y factual, con un orden fijo de importancia (por ejemplo, «正面は交差点です。» para un cruce al frente).
- Deteccion y narracion de elementos del entorno peatonal: intersecciones, pavimento tactil, vallas de obra, personas (descritas sin inferir su movimiento), coches y estructuras.
- Modo «caminando»: una a tres frases cortas por imagen.
- Modo «detenido» (desde v2): descripcion mas extensa de unas 120 letras japonesas, primero personas, coches y estructuras, luego nombres de comercios y edificios cuando el rotulo lo permite, y finalmente el ambiente.
- Gestion de imagenes no utilizables: responde «この写真では周囲の状況を説明できません。» cuando la lente esta cubierta o la imagen no es aprovechable.
- Capacidad de vision conservada del modelo base (capas de vision sin modificar).
- Ejecucion completamente local en dispositivo (on-device), sin envio de imagenes a servidores externos.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, audio ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Narracion del entorno para peatones ciegos o con baja vision: el modelo recibe una foto del iPhone en el bolsillo del pecho y devuelve una o tres frases cortas en japones que el sintetizador del telefono lee en voz alta; es el caso de uso principal de la app SoraEyeAI.
- Descripcion detallada al detenerse: cuando el usuario se para, la app solicita una descripcion mas larga (unas 120 letras) que identifica personas, vehiculos, estructuras y, si el rotulo es legible, nombres de comercios o edificios, util para orientarse en una calle comercial.
- Deteccion de pavimento tactil y obstaculos: el modelo informa de la presencia de bloques tactiles a izquierda o derecha y de vallas de obra, complementando la informacion que el usuario obtiene con el baston blanco.
- Alertas de confusion en el entorno: gracias al ajuste de la v3, evita describir tapas metalicas de alcantarilla como pavimento tactil, reduciendo falsas senales en rutas habituales.
- Aviso de camara obstruida: cuando la lente esta tapada por la ropa, el modelo responde con un mensaje explicito de que no puede describir la escena, lo que permite a la app indicar al usuario que reajuste el telefono.
- Uso sin conexion y con privacidad estricta: al ejecutarse integramente en el dispositivo, encaja en escenarios donde no se desea transmitir imagenes del entorno personal a la nube, como personas vulnerables o entornos domesticos.
- Base para prototipos de asistencia visual en japones: al estar bajo Apache 2.0 y en GGUF, puede integrarse en otras aplicaciones de accesibilidad o en investigacion sobre descripcion de escenas en japones con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: el modelo Q6_K ocupa 3.464.055.296 bytes (unos 3,46 GB) y el proyector F16 672.423.616 bytes (unos 672 MB); la app declara un uso de unos 8 GB de memoria en el iPhone y unos 5 GB de almacenamiento libre.
- GPU recomendadas: no se especifican GPU de escritorio; el destino declarado es el iPhone 15 Pro o posterior (iOS 17.0 o superior) con aceleracion integrada.
- Compatibilidad con GPU de consumo: no se documenta explicitamente; por tamano (4,2 mil millones de parametros en Q6_K) seria viable en GPU de consumo con suficiente memoria, pero el autor no lo confirma.
- Opciones de despliegue: llama.cpp (formato GGUF con `mmproj-F16.gguf`); integracion en aplicacion iOS mediante la app SoraEyeAI. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: la documentacion de la app advierte que entre la captura de la foto y la locucion transcurren varios segundos, por lo que la descripcion corresponde a una escena ligeramente anterior; no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Qwen3.5-4B-SoraEyeAI-GGUF | 4.205.751.296 | No disponible | Japones | Apache 2.0 | GGUF Q6_K + mmproj F16 | Descripcion de escenas para accesibilidad, on-device |
| Qwen3.5-4B (base) | 4.205.751.296 (segun dato del repo derivado) | No disponible | No disponible | No disponible en la informacion | Safetensors y GGUF (via `unsloth/Qwen3.5-4B-GGUF`) | Vision-lenguaje generalista |
| Otras alternativas de vision-lenguaje de ~4B | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La informacion proporcionada no incluye datos de rendimiento comparativo con otros modelos de la misma categoria, por lo que la comparativa se limita a parametros, licencia y formato.

## Limitaciones y advertencias

- El modelo no sustituye al baston blanco, al perro guia ni a la asistencia humana; la propia app lo advierte de forma explicita.
- No debe usarse para decisiones de navegacion, para juzgar si es seguro cruzar, para leer colores de semaforos ni como sustituto de ayuda humana.
- Riesgo de error de percepcion: el autor reconoce que el modelo puede confundirse («見間違えることがあります»), y la version v3.1 muestra diferencias pequenas respecto a la v3 en fotos no vistas, con un ligero aumento de menciones a postes electricos.
- Latencia no despreciable: la descripcion corresponde a una escena de varios segundos antes, lo que limita su uso en situaciones de movimiento rapido.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible; el entrenamiento se centra en rutas y escenas urbanas japonesas, lo que puede reducir su generalizacion a otros entornos.
- Limitacion idiomatica: el modelo esta ajustado para producir japones; no se garantiza un comportamiento adecuado en castellano u otros idiomas.
- Longitud de contexto: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribuir el modelo base Qwen3.5-4B; el nombre SoraEyeAI corresponde a la app del desarrollador.
- En produccion conviene mantener el aviso de que la salida es una descripcion factual y no una garantia de seguridad, y verificar el SHA-256 de los ficheros GGUF y del proyector antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nori-sdc/Qwen3.5-4B-SoraEyeAI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del modelo base en GGUF usado para el ajuste: https://huggingface.co/unsloth/Qwen3.5-4B-GGUF
- Aplicacion SoraEyeAI en la App Store: https://apps.apple.com/jp/app/soraeyeai/id6818048876
- Sitio web del desarrollador: https://soraeyeai.computing.jp/

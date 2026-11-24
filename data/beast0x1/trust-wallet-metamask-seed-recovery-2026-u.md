# beast0X1/trust-wallet-metamask-seed-recovery-2026-u

## Resumen

La ficha solicitada corresponde al identificador `beast0X1/trust-wallet-metamask-seed-recovery-2026-u` publicado en Hugging Face. Tras revisar la informacion disponible, no se trata de un modelo de inteligencia artificial ni de un artefacto de aprendizaje automatico: es un repositorio que distribuye un supuesto ejecutable para Windows (`fisch-script-auto-catch-macro-v1.2.2-win64.exe`) empaquetado en un ZIP protegido con contrasena, presentado como herramienta de "recuperacion de seed" de monederos Trust Wallet y MetaMask.

El contenido de la model card no describe arquitectura, parametros, tokenizador, datos de entrenamiento ni pesos. Los campos tecnicos habituales (pipeline, formato de pesos, contexto) no estan disponibles o simplemente no existen. Los tags declarados (windows, x64, portable) y la estructura del README apuntan a una pagina de distribucion de software, no a un modelo.

Desde el punto de vista de evaluacion tecnica, este repositorio presenta indicios claros de ser un senuelo malicioso: promete recuperar frases semilla de carteras de criptomonedas, incluye un binario ofuscado con instrucciones para ejecutarlo como administrador, emplea una contrasena fija en el archivo comprimido para evadir analisis automatizados y mezcla nombres de proyectos ajenos (un macro de un videojuego). No debe descargarse ni ejecutarse. La ficha se completa a continuacion con los datos verificables y con la advertencia explicita de que no es un modelo de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; repositorio de distribucion de software para Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos; no implica capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` para Windows x64) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir. El repositorio no contiene pesos, tokenizador, configuracion de transformer, datos de preentrenamiento ni etapas de ajuste (SFT, RLHF o DPO). El contenido es un README con enlaces a un archivo `fisch-script-auto-catch-macro-v1.2.2-win64.zip` de 4,8 MB, protegido con la contrasena `2026`, que supuestamente contiene un ejecutable de "recuperacion de seed" para Trust Wallet y MetaMask.

La unica "innovacion" declarada en la model card son modulos de software de escritorio (parser de LevelDB, validador BIP39, motor SIMD multinucleo, rotacion de RPC). Estos terminos pertenecen al dominio de herramientas de recuperacion de carteras y no a un modelo fundacional. La combinacion de nombres de proyectos no relacionados (un macro de pesca para un videojuego y un supuesto recuperador de semillas) es un patron tipico de campanas de malware distribuidas mediante repositorios señuelo.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No dispone de tool calling ni function calling en el sentido de un LLM.
- No soporta agentes ni razonamiento multi-paso como capacidad de modelo.
- Los "modulos" descritos en la model card (validador BIP39, parser de keystore LevelDB, exportacion de balances) son funcionalidades de una aplicacion de escritorio segun el autor, no capacidades de inferencia.
- El binario se presenta para Windows 10 (22H2) y Windows 11 (24H2) en x64, con instrucciones de ejecucion como administrador.
- No hay evidencia de capacidades multilingues reales mas alla de la lista de idiomas en los metadatos.

## Casos de uso

- Ninguno legitimo como modelo de IA: no hay inferencia que realizar.
- Auditoria de seguridad defensiva: analizar el repositorio en un entorno aislado para identificar el binario y su cadena de distribucion, con el objetivo de bloquearlo en redes corporativas.
- Concienciacion y formacion: usar la pagina como ejemplo documentado de ingenieria social dirigida a titulares de criptomonedas (phishing de frases semilla).
- Inteligencia de amenazas: registrar hashes del ZIP y del `.exe`, dominios de descarga y patrones de nombres para alimentar reglas de deteccion.
- Analisis de malware: extraer el contenido del ZIP con la contrasena indicada en un sandbox sin red para estudiar su comportamiento.
- No se recomienda ningun uso productivo, educativo ni de recuperacion real de carteras con este artefacto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra metrica de modelos, porque no es un modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Sistema operativo objetivo del binario: Windows 10 (22H2) y Windows 11 (24H2), x64.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; los valores citados en la model card (menos de 21 ms, menos de 65 MB de RAM) son afirmaciones del autor no verificadas.

## Comparativa con modelos similares

No disponible. No existe categoria de modelos comparable porque el artefacto no es un modelo de IA. Como referencia de categoria, se compara con otros repositorios de Hugging Face de naturaleza similar (distribucion de software o senuelos):

| Repositorio | Tipo de artefacto | Parametros | Contexto | Licencia | Riesgo |
|---|---|---|---|---|---|
| beast0X1/trust-wallet-metamask-seed-recovery-2026-u | ZIP con `.exe` para Windows | no aplica | no aplica | MIT (declarada) | Alto: posible malware y phishing de seeds |
| Modelo LLM tipico (p. ej. familia Llama, Qwen, Mistral) | Pesos safetensors/GGUF | Miles de millones | Miles de tokens | Licencia de modelo | Bajo o medio segun uso |
| Repositorio de utilidades legitimo | Codigo fuente o binarios firmados | no aplica | no aplica | Variable | Bajo si es verificable |

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse como tal ni incluirse en comparativas de LLM.
- Riesgo elevado de malware: el repositorio distribuye un ejecutable de procedencia desconocida y sin firma verificable, con instrucciones para ejecutarlo como administrador.
- Phishing de frases semilla: la promesa de "recuperar" seeds de Trust Wallet y MetaMask es un vector clasico para robar fondos de criptomonedas. Ninguna herramienta legitima necesita la frase semilla de una cartera de terceros.
- Contrasena fija en el ZIP (`2026`): dificulta el analisis automatico por antivirus y servicios de escaneo, un patron habitual en campanas maliciosas.
- Suplantacion de identidad de proyectos: el nombre del ZIP hace referencia a un macro de un videojuego no relacionado, lo que indica agregacion de contenido para mejorar el posicionamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso legitimo ni de validacion por la comunidad.
- Licencia MIT declarada: aunque permite uso comercial segun el texto, no cubre la legalidad del contenido distribuido ni exime de responsabilidad por el uso del binario.
- Idiomas listados en metadatos: no implican soporte linguistico real, ya que no hay modelo detras.
- Recomendacion: no descargar, no extraer y no ejecutar el archivo. Si ya se ha ejecutado, tratar el sistema como comprometido, rotar todas las frases semilla y claves privadas desde un dispositivo limpio y revisar movimientos de fondos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/beast0X1/trust-wallet-metamask-seed-recovery-2026-u
- Enlace de descarga citado en la model card (no visitar): https://github.com/ekaterina96522/fisch-script-auto-catch-macro/releases/download/v1.2.0/fisch-script-auto-catch-macro-v1.2.2-win64.zip
- Pagina de releases citada en la model card (no visitar): https://github.com/alexeimendoza/trust-wallet-metamask-seed-recovery-2026-unlocked/releases/latest
- Paper, blog, demo o repositorio oficial: no disponible

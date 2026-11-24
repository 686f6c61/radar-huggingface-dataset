# alfandaxdrake14/binance-bybit-funding-arbitrage-bot

## Resumen

No, esto no es un modelo de IA. El repositorio `alfandaxdrake14/binance-bybit-funding-arbitrage-bot` alojado en Hugging Face no contiene pesos, arquitectura ni artefactos de aprendizaje automatico: es un paquete ejecutable para Windows x64 (un `.zip` con un `.exe` y contrasena de descompresion) distribuido a traves de un repositorio de GitHub de terceros. La model card no describe ninguna red neuronal, tokenizador, dataset ni proceso de entrenamiento, sino instrucciones de descarga y ejecucion de un binario.

El contenido de la model card es, ademas, incoherente con su propio titulo: mezcla terminologia de arbitraje de financiacion entre exchanges (Binance y Bybit) con referencias a "Luau VM bridge", "hookmetamethod", "getgc", "Drawing API" y "sUNC compatibility", que son propios de ejecutores de scripts para videojuegos (Roblox), no de un bot de trading. Esta mezcla de vocabularios, junto con el patron de distribucion (ZIP con contrasena, enlace a un repositorio de GitHub ajeno al autor, peticion de ejecutar como administrador), es una senal de alarma clasica de malware o de campana de ingenieria social.

Desde la perspectiva de un editor tecnico de IA open source, la ficha correcta es la de "no evaluable como modelo": no hay nada que medir en MMLU, HumanEval ni latencia de inferencia. Lo relevante ahora es documentar el artefacto para que desarrolladores e investigadores no lo confundan con un modelo y sepan identificarlo como riesgo de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos de la model card; no verificable) |
| Licencia | MIT (declarada en los metadatos) |
| Formato de pesos | no disponible (el artefacto distribuido es `binance-bybit-funding-arbitrage-bot-v1.2.0-win64.zip`, 8,9 MB) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, tokenizador ni etapa de alineacion (RLHF, DPO, SFT). El repositorio no publica `config.json`, `tokenizer.json`, ficheros `safetensors`, `GGUF` ni `ONNX`. El unico artefacto descrito es un binario compilado para Windows 10/11 x64, con instrucciones para descomprimirlo con contrasena `2026` y ejecutarlo con privilegios de administrador.

La model card menciona "5 worker threads", "4 worker threads", "188 Hz polling" y "< 35 ms de tiempo de respuesta", pero estos numeros describen el comportamiento declarado del ejecutable, no el de un modelo. No hay forma de verificar esas cifras a partir de la informacion disponible, y no se aporta codigo fuente, hash del binario ni firma reproducible.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe codigo ni resuelve matematicas.
- No soporta tool calling ni function calling en el sentido de una API de inferencia.
- No soporta agentes ni razonamiento multi-paso basado en LLM.
- Las capacidades multilingues declaradas (14 idiomas) corresponden a los metadatos de la model card, no a un tokenizador verificable.
- El binario declara funcionalidades de "arbitrage de financiacion" entre Binance y Bybit, pero no se documenta ninguna integracion con API real de exchange, gestion de claves, control de riesgo ni backtesting.
- La model card referencia capacidades de ejecucion de scripts (Luau VM, `hookmetamethod`, `getgc`, Drawing API) que no guardan relacion con el titulo del proyecto.

## Casos de uso

- Auditoria de seguridad: analizar el ZIP y el ejecutable en un entorno aislado (sandbox, maquina virtual sin red) para determinar su comportamiento real antes de cualquier uso.
- Formacion en deteccion de malware: usar el patron (ZIP con contrasena, enlace a repositorio de GitHub de terceros, peticion de ejecutar como administrador, mezcla de dominios tecnicos) como caso de estudio de ingenieria social en cursos de seguridad.
- Monitorizacion de cadena de suministro: incluir este tipo de repositorios en los filtros de un proxy de artefactos corporativo para bloquear descargas no verificadas.
- Investigacion de fraude financiero: documentar la categoria "bot de arbitraje de financiacion" como vector recurrente de estafa, ya que promete rendimiento sin aportar codigo ni datos auditables.
- Concienciacion de equipos: incluir la ficha en un catalogo interno de "artefactos no recomendados" para evitar que un desarrollador lo confunda con una libreria de trading.
- Analisis de metadatos de Hugging Face: estudiar como se cuelan artefactos no-ML en un hub de modelos y que controles de moderacion serian necesarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K, MT-Bench ni de latencia/throughput de inferencia porque no hay modelo subyacente que evaluar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no hay inferencia).
- GPU recomendadas: no disponible. El artefacto declara ejecutarse en CPU x64 (Intel/AMD) sobre Windows 10/11.
- Cabe en consumer GPU: no aplica; el binario declara un uso de RAM inferior a 41 MB en una de sus rutinas y menos de 36 MB en otra, cifras no verificables.
- Opciones de despliegue: no aplica (no es compatible con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: la model card declara "< 35 ms" y "188 Hz de polling", sin metodologia de medida ni reproducibilidad.

## Comparativa con modelos similares

No disponible. No existe una categoria de "modelos de IA" comparable: las alternativas reales serian librerias de trading algoritmico auditables (por ejemplo, frameworks de backtesting y conectores de exchange con codigo fuente publico), pero no se dispone de datos verificables en la informacion proporcionada para establecer una comparacion tecnica rigurosa.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal.
- Riesgo de seguridad alto: ejecutable de origen no verificado, distribuido como ZIP con contrasena y alojado en un repositorio de GitHub de terceros (`Roger86476/...`) distinto del autor declarado en Hugging Face.
- La peticion de "ejecutar como administrador" amplia el impacto potencial de cualquier payload malicioso.
- Incoherencia interna grave: el titulo habla de arbitraje Binance/Bybit y el cuerpo describe hooks de Luau/Roblox, lo que sugiere contenido copiado o generado automaticamente.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Licencia MIT declarada, pero sin codigo fuente ni fichero `LICENSE` verificable en el repositorio de Hugging Face; el uso comercial del binario no esta garantizado ni es recomendable.
- Riesgo de alucinacion: no aplica a un LLM, pero si a la model card, que afirma capacidades (arbitraje, compatibilidad sUNC, "98%+") sin evidencia.
- Recomendacion: no descargar ni ejecutar en equipos de produccion ni en estaciones con credenciales de exchange.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/alfandaxdrake14/binance-bybit-funding-arbitrage-bot
- Repositorio de GitHub referenciado en la model card: https://github.com/Roger86476/binance-bybit-funding-arbitrage-bot
- Releases del repositorio de GitHub: https://github.com/Roger86476/binance-bybit-funding-arbitrage-bot/releases/latest
- Paquete directo citado en la model card: https://github.com/Roger86476/binance-bybit-funding-arbitrage-bot/releases/latest/download/binance-bybit-funding-arbitrage-bot-v1.2.0-win64.zip
- Paper, blog o demo oficial: no disponible

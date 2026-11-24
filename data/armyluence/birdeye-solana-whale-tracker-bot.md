# armyluence/birdeye-solana-whale-tracker-bot

## Resumen

La entrada `armyluence/birdeye-solana-whale-tracker-bot` de Hugging Face no contiene un modelo de aprendizaje automatico. Se trata de un repositorio que distribuye un supuesto ejecutable para Windows de 64 bits (`dandys-world-forsaken-script-2026-v1.2.2-win64.exe`, empaquetado en un ZIP de 4,8 MB) presentado como "bot de seguimiento de ballenas de Solana" con funciones de copytrade, bundles de Jito/MEV y enrutamiento de ordenes. No hay pesos, tokenizador, configuracion de arquitectura ni pipeline declarado (`pipeline: no disponible`).

El contenido de la model card es una plantilla de distribucion de software con enlaces a un repositorio de GitHub de terceros, contrasena de archivo (`2026`) y peticion explicita de ejecutar el binario como administrador. El nombre del archivo (`dandys-world-forsaken-script`) no guarda relacion con el titulo del repositorio, lo que constituye una discrepancia tipica de campanas de distribucion de software no verificado. El repositorio registra 0 descargas y 0 likes, y las cifras de la model card (532K+ descargas, valoracion 5.0/5) no son verificables desde Hugging Face.

Desde el punto de vista tecnico, no es evaluable como modelo: no existen parametros, contexto, cuantizaciones ni licencia aplicable a pesos inexistentes. La ficha se limita a documentar lo declarado y a senalar los riesgos de seguridad asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un binario Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (segun metadatos; corresponde a la interfaz del supuesto bot, no a capacidades linguisticas de un modelo) |
| Licencia | MIT (declarada en metadatos y model card) |
| Formato de pesos | no disponible (el artefacto distribuido es un `.zip` con un `.exe`; no hay `safetensors`, `GGUF` ni `ONNX`) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento documentado. El artefacto declarado es un ejecutable nativo para Windows x64 (`v2.7.7`, firma `8E8F8672ED`) que, segun la model card, implementa modulos de trading: sandbox de paper-trading con latencia declarada inferior a 22 ms, motor de bundles Jito/MEV con sondeo a 165 Hz, copytrade de carteras "smart-money" con consumo declarado inferior a 31 MB de RAM, take profit multinivel, bundler de 20 carteras mediante Lookup Tables y enrutamiento de ordenes por debajo de 40 ms sobre WebSocket y gRPC.

Ninguna de estas cifras es verificable: no se publican repositorios de codigo fuente, hashes de integridad, compilaciones reproducibles ni auditorias. El binario se distribuye a traves de un enlace a un repositorio de GitHub ajeno al autor del repositorio de Hugging Face, protegido con contrasena, y la model card instruye a ejecutarlo con privilegios de administrador. Este patron (binario opaco, contrasena de archivo, ejecucion elevada, nombre de archivo incoherente con el proyecto) coincide con tecnicas habituales de distribucion de malware o de software potencialmente no deseado.

## Capacidades

- No se documenta ninguna capacidad de generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No hay soporte declarado de tool calling ni function calling en el sentido de modelos de lenguaje.
- No hay soporte de agentes ni de razonamiento multi-paso.
- Las capacidades declaradas son funcionales de trading (copytrade, bundles MEV, take profit, enrutamiento de ordenes), no capacidades cognitivas.
- Multilingue solo a nivel de interfaz (14 idiomas listados en metadatos).
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

No se identifican casos de uso legitimos verificables para un modelo de IA, porque no hay modelo. Los escenarios que la model card sugiere deben tratarse con cautela extrema:

- Auditoria de cadena de suministro: usar el repositorio como caso de estudio de distribucion de binarios sin verificar (enlace externo, contrasena, ejecucion como administrador) en formacion de seguridad.
- Analisis de campanas de ingenieria social en Hugging Face: documentar como se reutilizan plantillas de model card para promocionar ejecutables ajenos al ecosistema de IA.
- Investigacion de fraude en criptoactivos: estudiar el patron de "bot de ballenas de Solana" como anzuelo recurrente en estafas de trading automatizado.
- Respuesta a incidentes: si un equipo ha descargado el ZIP, emplear la ficha como referencia para el triaje (hash del artefacto, contrasena `2026`, nombre del ejecutable).
- Docencia en seguridad de sistemas: ilustrar por que no debe ejecutarse un binario desconocido con privilegios elevados en estaciones de trabajo de desarrollo.
- No se recomienda su uso para trading real, copytrade, MEV ni gestion de carteras: no hay evidencia tecnica, auditoria ni soporte que respalde las afirmaciones de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Las unicas metricas presentes son afirmaciones de la model card (menos de 22 ms de respuesta, 165 Hz de sondeo, menos de 31 MB de RAM, 98,1 % de consistencia, enrutamiento por debajo de 40 ms) que no van acompanadas de metodologia, entorno de prueba ni codigo reproducible, por lo que no deben considerarse mediciones validas.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay pesos de modelo).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada: Windows 10/11 de 64 bits; el ejecutable requiere ejecucion como administrador segun la model card.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: solo afirmaciones del autor, no verificadas.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el artefacto no es un modelo de IA. Frente a herramientas legitimas de analisis on-chain (por ejemplo, APIs de datos de Solana o frameworks de trading auditados), este repositorio no ofrece codigo fuente, auditoria ni trazabilidad, por lo que cualquier comparacion tecnica carece de base.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, tokenizador ni configuracion; no puede ejecutarse con vLLM, llama.cpp, Ollama ni TGI.
- Riesgo de seguridad alto: binario opaco distribuido en un ZIP con contrasena y con instrucciones de ejecutarlo como administrador.
- Discrepancia de nombres: el ejecutable se llama `dandys-world-forsaken-script-2026-v1.2.2-win64.exe`, sin relacion con el titulo del repositorio.
- Enlaces de descarga alojados en un repositorio de GitHub de terceros (`pedrolong1343/...`), no en el espacio del autor en Hugging Face.
- Metricas de popularidad no verificables (532K+ descargas, valoracion 5.0/5) frente a 0 descargas y 0 likes registrados en Hugging Face.
- Licencia MIT declarada, pero sin implicaciones practicas al no existir codigo fuente ni pesos sobre los que ejercerla.
- Riesgo de fraude financiero: el supuesto bot opera en el dominio de criptoactivos (Solana, MEV, copytrade), un sector con alta incidencia de estafas.
- Riesgo de alucinacion: no aplica a un modelo de lenguaje, pero las afirmaciones de rendimiento del autor no estan respaldadas por evidencia.
- Recomendacion: no descargar ni ejecutar el binario; si ya se ha ejecutado, tratar el equipo como potencialmente comprometido y realizar analisis forense.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/armyluence/birdeye-solana-whale-tracker-bot
- Enlace de descarga citado en la model card (GitHub de terceros, no verificado): https://github.com/pedrolong1343/dandys-world-forsaken-script-2026/releases/download/v1.2.0/dandys-world-forsaken-script-2026-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card (no verificado): https://github.com/Nayeonb017/birdeye-solana-whale-tracker-bot/releases/latest
- Paper, blog, demo o repositorio oficial del modelo: no disponible

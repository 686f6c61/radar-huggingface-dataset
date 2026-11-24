# botaaaaa/gmgn-bullx-photon-copytrade-bot-unlocked

## Resumen

La ficha solicitada corresponde a `botaaaaa/gmgn-bullx-photon-copytrade-bot-unlocked`, un repositorio alojado en Hugging Face que **no contiene un modelo de IA**. Se trata de un paquete ejecutable para Windows x64 (un `.exe` dentro de un `.zip` de 4,8 MB) que el autor presenta como un bot de copytrading para plataformas de criptomonedas (GMGN, BullX, Photon). No hay pesos, no hay arquitectura de red neuronal, no hay tokenizador ni pipeline de inferencia asociado.

El repositorio carece de cualquier artefacto propio de un modelo: la pipeline aparece como "no disponible", no existen descargas ni likes, y los tags hacen referencia a sistema operativo (`windows`, `windows-11`, `x64`, `portable`) en lugar de a familias de modelos. La model card, redactada en tono comercial, describe módulos de trading (filtro de honeypots, bundler de 20 wallets, motor de bundles Jito/MEV, sandbox de paper trading) y enlaza la descarga a repositorios de GitHub de terceros, no a archivos del propio repositorio de Hugging Face.

Por tanto, esta ficha no puede evaluar capacidades de lenguaje, razonamiento o código, y se limita a documentar lo que el repositorio declara, señalando de forma explícita los riesgos de seguridad asociados. Cualquier uso en producción de software de trading descargado de fuentes no verificadas con contraseña de descompresión y ejecución como administrador debe considerarse de riesgo elevado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un ejecutable Windows x64) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto declarado es `rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip`, 4,8 MB, con contraseña `2026`) |

## Arquitectura y entrenamiento

No aplica. No existe arquitectura de red neuronal, corpus de entrenamiento, proceso de ajuste (RLHF, DPO, SFT) ni innovación técnica de inferencia que documentar. El contenido del repositorio es un binario portable para Windows 10/11 de 64 bits, según la model card, con build declarada `v4.7.1 (420AA2)`.

La model card menciona módulos funcionales (filtro pre-compra de honeypots con verificación de mint/freeze authority y bloqueo de LP, bundler de 20 wallets mediante Lookup Tables, copia de "smart money", sandbox de paper trading, motor de bundles Jito/MEV y take profit multinivel). Son descripciones de funcionalidad de software, no especificaciones verificables de un modelo, y no vienen acompañadas de código fuente, auditoría ni artefactos reproducibles en el repositorio de Hugging Face.

## Capacidades

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código ni resuelve matemáticas.
- No soporta tool calling ni function calling en el sentido de un LLM.
- No implementa agentes ni razonamiento multi-paso basado en modelos.
- El multilingüismo declarado se refiere a los idiomas de la documentación del repositorio, no a capacidades del artefacto.
- Funcionalidad declarada por el autor (no verificada): filtro de honeypots, bundling multi-wallet, copytrading, paper trading, bundles Jito/MEV y take profit escalonado.

## Casos de uso

- Evaluación de seguridad de software de terceros: el repositorio puede usarse como caso de estudio para analizar patrones de distribución de binarios no verificados (contraseña en el ZIP, ejecución como administrador, enlaces a repositorios de GitHub ajenos al autor).
- Investigación sobre riesgo en cadena de suministro: sirve para documentar tácticas habituales de ingeniería social en repositorios de Hugging Face que suplantan utilidades de trading.
- Formación en análisis de malware: un analista puede examinar el binario en un entorno aislado para identificar comportamiento, sin ejecutarlo en una máquina de producción.
- Revisión de políticas de moderación de plataformas: útil para equipos que definen criterios sobre qué artefactos deben permitirse en hubs de modelos.
- Concienciación de equipos de desarrollo: ejemplo práctico de por qué no deben ejecutarse binarios descargados de repositorios sin reputación, aunque declaren licencia MIT.
- Documentación de auditoría interna: registrar el repositorio como no apto para despliegue en entornos corporativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica (no hay modelo que cargar en GPU).
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Requisitos declarados del artefacto: Windows 10/11 de 64 bits, sin dependencias externas según el autor; el paquete ocupa 4,8 MB.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; el autor cita cifras de respuesta (`< 22 ms`) para módulos de trading, sin metodología de medición ni evidencia reproducible.

## Comparativa con modelos similares

No disponible. No existen modelos comparables porque el repositorio no contiene un modelo de IA. Frente a repositorios legítimos de utilidades de trading, la diferencia principal es que este no publica código fuente, no ofrece artefactos verificables en Hugging Face y distribuye el binario mediante enlaces externos con contraseña.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal en pipelines de inferencia.
- Riesgo de seguridad elevado: el flujo descrito (descargar un ZIP de un repositorio de GitHub de terceros, descomprimirlo con contraseña y ejecutar el `.exe` como administrador) es un patrón habitual de distribución de software malicioso.
- La model card reconoce explícitamente que Windows Defender o SmartScreen pueden alertar sobre el binario; desactivar o ignorar esas protecciones incrementa el riesgo de compromiso del sistema.
- El repositorio de Hugging Face no aloja el binario: los enlaces apuntan a cuentas de GitHub (`JoaoSchaefer973`, `VoMerkel8955`) que no coinciden con el autor del repositorio (`botaaaaa`), lo que impide verificar procedencia.
- Las cifras de rendimiento y consistencia citadas (99,1 %, 99,6 %, `< 22 ms`) no incluyen metodología ni evidencia y no deben tomarse como datos verificados.
- La licencia MIT declarada en los metadatos no garantiza nada sobre el binario distribuido externamente; la licencia del ejecutable real es desconocida.
- Uso en trading real conlleva riesgo financiero directo, además del riesgo de seguridad; no hay auditoría independiente publicada.
- Cero descargas y cero likes en el momento de la consulta: sin señal de reputación por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/botaaaaa/gmgn-bullx-photon-copytrade-bot-unlocked
- Enlace de descarga citado en la model card (GitHub, terceros): https://github.com/JoaoSchaefer973/rob-run-cheat-mod-menu-2026/releases/download/v1.2.0/rob-run-cheat-mod-menu-2026-v1.2.2-win64.zip
- Releases citadas en la model card (GitHub, terceros): https://github.com/VoMerkel8955/gmgn-bullx-photon-copytrade-bot-unlocked/releases/latest
- Paper, blog o demo oficial: no disponible

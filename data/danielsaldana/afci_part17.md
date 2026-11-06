# danielsaldana/AFCI_part17

## Resumen

`danielsaldana/AFCI_part17` no es un modelo de lenguaje ni una red neuronal entrenada, sino un repositorio de distribucion de software dentro de un kit de desarrollo offline para un sistema de deteccion de fallos de arco electrico (AFCI, *arc-fault circuit interrupter*) basado en un microcontrolador STM32F407. El repositorio contiene los paquetes oficiales de ST `stm32cubef4-v1-28-0.zip` (611,5 MB) y su parche `stm32cubef4-v1-28-3.zip` (314,1 MB), espejados sin modificaciones para permitir la instalacion de STM32CubeMX en un PC Windows 10/11 x64 sin conexion a internet.

El sistema completo que describe el autor encadena un sensor de corriente, la ADC con DMA del STM32F407, un pipeline de extraccion de caracteristicas FFT/STFT y una DNN cuantizada que decide el disparo (trip). El entrenamiento se plantea en Python sobre CPU, sin GPU. Este repositorio concreto (parte 17 de 19) cubre exclusivamente la capa de toolchain: drivers HAL/LL, CMSIS (incluidas las fuentes de CMSIS-DSP), BSP, middleware y ejemplos para placas STM32F4-Discovery.

Su relevancia es practica y de nicho: facilita la reproducibilidad de un entorno de desarrollo embebido en maquinas aisladas o sin acceso a st.com, un escenario habitual en laboratorios de certificacion electrica y en plantas industriales con red restringida. No aporta pesos, datasets ni resultados de evaluacion, por lo que no debe tratarse como un artefacto de IA evaluable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: paquete de software embebido (STM32CubeF4 para STM32CubeMX) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el kit menciona una DNN cuantizada, sin especificar esquema) |
| Idiomas soportados | No disponible |
| Licencia | `other`; los ficheros quedan sujetos a las licencias de ST (SLA0048 para herramientas, SLA0044 para firmware) |
| Formato de pesos | No disponible; los artefactos son archivos `.zip` divididos en `.part001`, `.part002`, ... |

## Arquitectura y entrenamiento

El contenido es el paquete oficial STM32CubeF4 version 1.28.0 mas el parche 1.28.3, que incluye drivers HAL y LL, CMSIS con codigo fuente de CMSIS-DSP, BSP, middleware y ejemplos para STM32F4-Discovery y otras placas F4. La instalacion se realiza en STM32CubeMX mediante *Help → Manage embedded software packages → From Local*, seleccionando los ZIP sin descomprimir; CubeMX los deposita en su repositorio local (por ejemplo `C:\STM32Cube\Repository\STM32Cube_FW_F4_V1.28.3`), desde donde quedan accesibles los ejemplos como `Projects\STM32F4-Discovery\Examples\ADC\ADC_RegularConversion_DMA`.

Los ficheros de mas de 100 MB se dividen en fragmentos y se reconstruyen con `join_parts.ps1` (Windows) o `join_parts.sh` (Linux/macOS), ambos con verificacion contra `SHA256SUMS.txt`. El repositorio ocupa 1,0 GB y contiene 2 ficheros por un total de 925,6 MB. No se documentan datos de entrenamiento, tokens, composicion de dataset ni tecnicas de alineacion como RLHF o DPO, porque el repositorio no contiene ningun modelo entrenado.

## Capacidades

- Distribucion offline del paquete STM32CubeF4 1.28.0 y su parche 1.28.3 para STM32CubeMX.
- Incluye drivers HAL y LL, CMSIS con fuentes de CMSIS-DSP (relevante para el pipeline FFT/STFT del sistema AFCI).
- Incluye BSP, middleware y ejemplos oficiales para STM32F4-Discovery y otras placas F4.
- Reconstruccion verificada de ficheros divididos mediante scripts PowerShell y Bash con comprobacion SHA256.
- No soporta generacion de texto, razonamiento, codigo generativo, vision, audio, tool calling ni agentes: no es un modelo de IA.
- El kit global (19 repositorios) describe un sistema AFCI completo con adquisicion ADC+DMA, extraccion de caracteristicas y DNN cuantizada, pero esta parte solo aporta la toolchain.

## Casos de uso

- Instalacion de STM32CubeMX en un PC Windows aislado de red: se copian los ZIP al equipo y se cargan desde *From Local*, evitando la descarga desde st.com.
- Reproduccion de builds en laboratorios de certificacion electrica con red restringida: la version fijada 1.28.3 y el `SHA256SUMS.txt` permiten garantizar que el toolchain es identico entre ejecuciones.
- Desarrollo del firmware AFCI sobre STM32F407: los ejemplos `ADC_RegularConversion_DMA` sirven como punto de partida para la captura de corriente con DMA.
- Prototipado de extraccion de caracteristicas en el propio MCU: las fuentes de CMSIS-DSP incluidas permiten compilar FFT/STFT sin dependencias externas.
- Formacion de nuevos miembros del equipo: el kit completo con indice maestro e instrucciones de instalacion reduce el tiempo de puesta a punto del entorno.
- Archivado a largo plazo de un toolchain reproducible: el espejo de los ZIP oficiales protege frente a cambios o retiradas de versiones en el sitio del fabricante.
- Integracion en imagenes de CI sin acceso a internet: los scripts de reconstruccion y verificacion permiten preparar el entorno de compilacion de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene pesos ni evaluaciones; los unicos datos cuantitativos son de tamano: 611,5 MB para `stm32cubef4-v1-28-0.zip` (7 fragmentos) y 314,1 MB para `stm32cubef4-v1-28-3.zip` (4 fragmentos), con 925,6 MB totales declarados en la tabla de ficheros.

## Requisitos de hardware

- No requiere GPU: el kit esta disenado para entrenamiento en CPU y el destino de inferencia es un microcontrolador STM32F407.
- PC de desarrollo: Windows 10/11 x64 segun la model card; los scripts de reconstruccion tambien cubren Linux y macOS.
- Espacio en disco: al menos 1,0 GB para el repositorio completo mas el espacio de los ZIP reconstruidos y el repositorio de CubeMX.
- Hardware de destino: placa STM32F4-Discovery u otra placa STM32F407; el sistema AFCI requiere ademas un sensor de corriente conectado a la ADC.
- Despliegue: STM32CubeMX para la generacion de proyecto y el toolchain asociado; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Tamano | Contexto | Licencia | Observaciones |
|---|---|---|---|---|---|
| `danielsaldana/AFCI_part17` | Paquete STM32CubeF4 para CubeMX | 925,6 MB (2 ficheros) | No aplica | `other` (SLA0048/SLA0044 de ST) | Espejo offline con parche 1.28.3 y scripts de reconstruccion |
| Descarga directa desde st.com (myST) | Canal oficial | Variable | No aplica | Licencias ST | Requiere cuenta y conexion a internet |
| `danielsaldana/AFCI_part1` | Codigo ST desde GitHub | No disponible | No aplica | No disponible | Mismo contenido funcional, pero CubeMX exige los ZIP empaquetados por ST |
| Resto de partes del kit (part2 a part19) | Otros componentes del kit AFCI | No disponible | No aplica | No disponible | Indice maestro e instrucciones en `AFCI_part6` |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona y no puede evaluarse con MMLU, HumanEval ni GSM8K.
- La licencia `other` remite a los acuerdos de ST (SLA0048 para herramientas, SLA0044 para firmware); el uso comercial exige revisar y aceptar dichos terminos, y el autor no concede derechos adicionales.
- El repositorio redistribuye software propietario de ST espejado sin modificaciones; la responsabilidad sobre el cumplimiento de las licencias recae en quien lo instala.
- La fecha de creacion indicada (2026-11-02) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos; conviene verificar la integridad con `SHA256SUMS.txt`.
- Cero descargas y cero likes: no hay evidencia de uso ni validacion por terceros.
- Dependencia de version concreta (1.28.0 mas parche 1.28.3); mezclar con otras versiones del firmware F4 puede romper la reproducibilidad.
- Los ficheros divididos requieren ejecutar los scripts de union antes de usarlos; un ZIP parcial no es instalable en CubeMX.
- No se documentan sesgos, alucinaciones ni limitaciones de idioma porque no aplican a este artefacto.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/danielsaldana/AFCI_part17
- Indice maestro del kit: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_START_HERE_MASTER_INDEX.md
- Guia de instalacion: https://huggingface.co/danielsaldana/AFCI_part6/blob/main/00_INSTALLATION_GUIDE.md
- Pagina oficial de STM32CubeF4 (referencia del software espejado): no disponible en la informacion proporcionada
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada

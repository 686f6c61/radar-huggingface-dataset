# Snapkitty/sovereign-hypervisor-sdk

## Resumen

Snapkitty/sovereign-hypervisor-sdk no es un modelo de inteligencia artificial convencional, sino un repositorio de definiciones de API y documentacion para una plataforma de hipervisor soberano para ARM64 EL2, junto con un supuesto fabric de chip llamado ORTHO-32-T y un nucleo AGI formalmente verificado escrito en Idris 2. El autor, Jessica L. Westerhoff (SNAPKITTYWEST), publica unicamente la superficie de API en formato TypeScript con stubs; la implementacion completa reside en un repositorio privado y requiere licencia de pago.

El proyecto se estructura en tres capas: un fabric de chip RISC de 32 bits con tiles tensoriales INT8 de 4x4, un hipervisor ARM64 EL2 con maquina virtual 6502 y un puente de traduccion NASM x86_64 a ARM64, y un nucleo AGI con axiomas de seguridad verificados en tiempo de compilacion. No se proporcionan pesos, parametros, datos de entrenamiento ni resultados de benchmarks de modelos de lenguaje; la unica evidencia de verificacion formal citada es un DOI de Zenodo con 78 teoremas Lean 4. El repositorio tiene cero descargas y cero likes, y fue creado en septiembre de 2026.

La relevancia actual del proyecto es cuestionable desde la perspectiva de un desarrollador de IA: no existe un modelo descargable ni ejecutable sin licencia comercial, y las afirmaciones sobre verificacion formal y determinismo no son comprobables de forma independiente con la informacion publica disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de redes neuronales; plataforma de hipervisor ARM64 EL2 + fabric RISC ORTHO-32-T + nucleo AGI en Idris 2) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | BSL-1.1, AGPL-3.0 y MPL-2.0 declaradas de forma simultanea; implementacion tras paywall con licencia de pago obligatoria |
| Formato de pesos | No aplica (el repositorio contiene stubs TypeScript y documentacion; sin pesos distribuidos) |

## Arquitectura y entrenamiento

El repositorio no describe un modelo entrenado con datos, sino un sistema software de tres capas. La capa 1, ORTHO-32-T, es un fabric de chip RISC de 32 bits con pipeline de 5 etapas, 8 registros tensoriales (TR0-TR7) y tiles INT8 de 4x4, con un GEMM 4x4x4 determinista de 768 ciclos que el autor afirma probado formalmente con TLA+ y Lean 4. La capa 2 es un hipervisor ARM64 EL2 con una VM 6502 de 64 KB, un traductor NASM x86_64 a ARM64 y una cadena de arranque WORM (write-once-read-many) de 4 etapas. La capa 3 es un nucleo AGI en Idris 2 con cinco axiomas de seguridad que se verifican en tiempo de compilacion, incluyendo tipos inhabitados como `Active => Trusted` y una cadena WORM sin constructor de eliminacion.

No existe informacion sobre entrenamiento, dataset, tokens procesados ni tecnicas como RLHF o DPO, porque no se trata de un modelo de aprendizaje automatico. La unica referencia a verificacion formal externa es un DOI de Zenodo (10.5281/zenodo.21268911) con 78 teoremas Lean 4, fechado en julio de 2026, que no es verificable desde el repositorio publico.

## Capacidades

Segun la superficie de API publica (stubs), el sistema declara las siguientes capacidades:

- Escritura de payloads en un buzón (mailbox) de la VM 6502 en la direccion $2000, con presupuesto de ciclos y identificador de guest.
- Traduccion de codigo fuente NASM x86_64 a ARM64 de Apple mediante un puente de traduccion.
- Ejecucion de tiles GEMM deterministas de 4x4x4 con contrato de temporizacion de 768 ciclos.
- Verificacion de afirmaciones de razonamiento a traves de un nucleo AGI con puerta de verificacion.
- Consulta de estado de la plataforma (status).
- Arranque en modo compatibilidad en el puerto :8788, con destino EL2 en vivo que requiere un endpoint conectado.

No se documentan capacidades de generacion de texto, razonamiento de lenguaje natural, codigo, matematicas, vision, tool calling, agentes ni soporte multilingue, al no ser un modelo de lenguaje.

## Casos de uso

Dado que la implementacion no es publica y requiere licencia de pago, los casos de uso son especulativos y se derivan exclusivamente de la documentacion:

- Despliegue de hipervisor en hardware ARM64 EL2: el sistema declara un hipervisor con cadena de confianza WORM, orientado a entornos con requisitos de integridad de arranque verificable.
- Computacion tensorial determinista en ASIC: el fabric ORTHO-32-T podria utilizarse en entornos donde se requiera latencia determinista y verificacion formal, como alternativa declarada a Intel AMX.
- Verificacion de invariantes de seguridad en tiempo de compilacion: el nucleo AGI en Idris 2 impide por tipos la eliminacion de entradas WORM o la existencia de estados activos no confiables, lo que podria aplicarse a sistemas de control de acceso.
- Traduccion de ensamblador x86_64 a ARM64: el puente NASM podria servir para migrar codigo de bajo nivel entre arquitecturas, aunque no hay evidencias de su funcionamiento.
- Auditoria de cadena de suministro de firmware: la cadena de arranque WORM sellada con Ed25519 y Blake3 podria integrarse en pipelines de firmware con requisitos de no repudio.
- Investigacion academica sobre verificacion formal de hipervisores: los 78 teoremas Lean 4 publicados en Zenodo podrian servir como referencia para otros proyectos de verificacion, si son accesibles.

En todos los casos, el acceso a la implementacion real esta restringido por licencia, por lo que ninguno de estos escenarios es reproducible sin contacto comercial con el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones comparativas contra otros sistemas, ni metricas de rendimiento de inferencia, latencia o throughput medidos de forma independiente. Las unicas cifras declaradas son internas del autor: 9 ciclos por tile y 768 ciclos para el GEMM 4x4x4, sin metodologia publica de medicion.

## Requisitos de hardware

- No se especifican requisitos de VRAM, GPU ni memoria para inferencia, al no ser un modelo de redes neuronales.
- El destino declarado para el fabric ORTHO-32-T es una ASIC en TSMC 28nm o SkyWater 130nm, segun la documentacion.
- La capa de hipervisor se orienta a ARM64 EL2, con un modo compatibilidad en AMD64 (UEFI, GDT/IDT/paging/TSS) para arranque bare-metal.
- No se mencionan opciones de despliegue como vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de software.
- No se proporcionan datos de latencia ni throughput verificables.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de lenguaje ni un sistema de IA comparable con alternativas como Llama, Mistral, Qwen o DeepSeek. La unica comparativa incluida en la documentacion es la tabla contra Intel AMX, que enfrenta el fabric ORTHO-32-T con la extension AMX de Intel en terminos de latencia determinista, verificacion formal, dependencia de proveedor y estado de patentes. Esa comparativa es una afirmacion del autor y no ha sido validada de forma independiente.

## Limitaciones y advertencias

- El repositorio contiene exclusivamente stubs de API y documentacion; no hay software ejecutable sin licencia de pago.
- La licencia declarada es confusa: se citan simultaneamente BSL-1.1, AGPL-3.0 y MPL-2.0, ademas de un aviso de paywall y patente pendiente. Esto genera incertidumbre juridica sobre los terminos reales de uso, incluso para lectura.
- No hay evidencias publicas de que el sistema funcione: cero descargas, cero likes y sin demos accesibles.
- Las afirmaciones de verificacion formal (TLA+, Lean 4, Idris 2) no son comprobables desde el repositorio; el DOI de Zenodo no esta enlazado directamente.
- No es un modelo de IA: cualquier expectativa de capacidades de generacion de texto, razonamiento o codigo es incorrecta.
- El proyecto menciona una entidad fiduciaria (Bel Esprit D'Accord Irrevocable Trust) y un estado de patente pendiente, lo que anade restricciones adicionales de uso comercial y reproduccion.
- Riesgo alto de que las afirmaciones tecnicas no sean verificables ni reproducibles en entornos de produccion sin acceso al codigo privado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Snapkitty/sovereign-hypervisor-sdk
- Pagina de licencia: https://snapkittywest.dev/license
- Organizacion GitHub declarada: https://github.com/SNAPKITTYWEST
- DOI Zenodo citado (no verificado): 10.5281/zenodo.21268911
- Contacto de licencias: licensing@snapkittywest.dev
